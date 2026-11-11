/**
 * GEORGE GUI @Search — Luau static analysis engine ("George Engineer" review).
 *
 * Rule-based linting specialised for Roblox production quality:
 * deprecated APIs, unsafe DataStore access, unvalidated remotes, frozen
 * loops, global leakage, debug leftovers and exploit-resistance basics.
 */

export type Severity = "error" | "warning" | "info";

export interface ReviewIssue {
  rule: string;
  severity: Severity;
  line: number;
  message: string;
  suggestion: string;
}

export interface ReviewResult {
  passed: boolean;
  lines: number;
  errors: number;
  warnings: number;
  infos: number;
  issues: ReviewIssue[];
  summary: string;
}

interface RuleDef {
  id: string;
  pattern: RegExp;
  severity: Severity;
  message: string;
  suggestion: string;
}

const SIMPLE_RULES: RuleDef[] = [
  {
    id: "deprecated-wait",
    pattern: /(?<![:.\w])wait\s*\(/,
    severity: "error",
    message: "Global wait() is deprecated and throttles unpredictably.",
    suggestion: "Use task.wait(n).",
  },
  {
    id: "deprecated-spawn",
    pattern: /(?<![:.\w])spawn\s*\(/,
    severity: "error",
    message: "Global spawn() is deprecated.",
    suggestion: "Use task.spawn(fn).",
  },
  {
    id: "deprecated-delay",
    pattern: /(?<![:.\w])delay\s*\(/,
    severity: "error",
    message: "Global delay() is deprecated.",
    suggestion: "Use task.delay(n, fn).",
  },
  {
    id: "loadstring",
    pattern: /\bloadstring\s*\(/,
    severity: "error",
    message: "loadstring executes arbitrary code and is an exploit vector.",
    suggestion: "Remove loadstring; use structured data instead of dynamic code.",
  },
  {
    id: "environment-escape",
    pattern: /\b(getfenv|setfenv)\s*\(/,
    severity: "error",
    message: "Environment access is a common obfuscation/exploit pattern.",
    suggestion: "Remove getfenv/setfenv usage.",
  },
  {
    id: "prefer-updateasync",
    pattern: /[:.]SetAsync\s*\(/,
    severity: "warning",
    message: "SetAsync overwrites without conflict detection.",
    suggestion: "Prefer UpdateAsync so concurrent writes are merged safely.",
  },
  {
    id: "debug-print",
    pattern: /(?<![:.\w])print\s*\(/,
    severity: "info",
    message: "Leftover print() call.",
    suggestion: "Remove debug prints or route them through a debug flag.",
  },
  {
    id: "legacy-game-reference",
    pattern: /\bGame[.:]/,
    severity: "warning",
    message: "Legacy global 'Game' reference.",
    suggestion: "Use the lowercase 'game'.",
  },
  {
    id: "require-waitforchild-asset",
    pattern: /require\s*\(\s*\d+/,
    severity: "warning",
    message: "Requiring an asset by numeric id pulls remote code.",
    suggestion: "Require local ModuleScripts; never require unvetted remote assets.",
  },
];

export function reviewLuau(source: string): ReviewResult {
  const issues: ReviewIssue[] = [];
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineNo = i + 1;
    const isComment = /^\s*--/.test(line);

    for (const rule of SIMPLE_RULES) {
      if (isComment && rule.id !== "missing-strict") continue;
      const match = rule.pattern.exec(line);
      if (match) {
        issues.push({
          rule: rule.id,
          severity: rule.severity,
          line: lineNo,
          message: rule.message,
          suggestion: rule.suggestion,
        });
      }
    }
  }

  // DataStore calls must be pcall-protected.
  const dataStorePattern = /[:.](GetAsync|SetAsync|UpdateAsync|IncrementAsync|RemoveAsync|GetSortedAsync)\s*\(/;
  for (let i = 0; i < lines.length; i += 1) {
    if (!dataStorePattern.test(lines[i])) continue;
    let protectedCall = false;
    for (let j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 1); j += 1) {
      if (/\bpcall\s*\(/.test(lines[j]) || /local success/.test(lines[j]) && /pcall/.test(lines[j])) {
        protectedCall = true;
        break;
      }
    }
    if (!protectedCall) {
      issues.push({
        rule: "datastore-unprotected",
        severity: "error",
        line: i + 1,
        message: "DataStore call is not wrapped in pcall; throttling/errors will crash the thread.",
        suggestion: "Wrap the call in pcall and retry with backoff.",
      });
    }
  }

  // RemoteEvent handlers on the server must validate payload types.
  const remotePattern = /OnServerEvent\s*:\s*Connect/;
  for (let i = 0; i < lines.length; i += 1) {
    if (!remotePattern.test(lines[i])) continue;
    let validates = false;
    for (let j = i + 1; j <= Math.min(lines.length - 1, i + 10); j += 1) {
      if (/(\btypeof\s*\(|\btype\s*\(|\bassert\s*\(|:IsA\()/.test(lines[j])) {
        validates = true;
        break;
      }
    }
    if (!validates) {
      issues.push({
        rule: "remote-unvalidated",
        severity: "warning",
        line: i + 1,
        message: "OnServerEvent handler does not validate its payload within 10 lines; exploiters can fire remotes with arbitrary data.",
        suggestion: "Check typeof() on every payload field before use, or generate validation with the secure-remotes template.",
      });
    }
  }

  // while true loops must yield.
  for (let i = 0; i < lines.length; i += 1) {
    if (!/while\s+true\s+do/.test(lines[i])) continue;
    let yields = false;
    for (let j = i + 1; j <= Math.min(lines.length - 1, i + 8); j += 1) {
      if (/(task\.wait|wait\s*\(|RunService\.Heartbeat:Wait|\.Stepped:Wait|coroutine\.yield)/.test(lines[j])) {
        yields = true;
        break;
      }
      if (/\bend\b/.test(lines[j]) && /while/.test(lines[i])) {
        break;
      }
    }
    if (!yields) {
      issues.push({
        rule: "frozen-loop",
        severity: "error",
        line: i + 1,
        message: "while-true loop without a yield will freeze the thread.",
        suggestion: "Add task.wait() inside the loop.",
      });
    }
  }

  // InputBegan handlers should honour gameProcessedEvent.
  const inputPattern = /InputBegan\s*:\s*Connect\s*\(\s*function\s*\(/;
  for (let i = 0; i < lines.length; i += 1) {
    if (!inputPattern.test(lines[i])) continue;
    let honours = /gameProcessed/.test(lines[i]) || /processed/.test(lines[i]);
    for (let j = i + 1; j <= Math.min(lines.length - 1, i + 6) && !honours; j += 1) {
      if (/gameProcessed|processed/.test(lines[j])) honours = true;
    }
    if (!honours) {
      issues.push({
        rule: "input-ignores-processed",
        severity: "warning",
        line: i + 1,
        message: "InputBegan handler ignores gameProcessedEvent, so typing in chat or textboxes will trigger the binding.",
        suggestion: "Add the gameProcessedEvent parameter and return early when it is true.",
      });
    }
  }

  // Strict mode recommendation.
  const hasStrict = source.includes("--!strict") || source.includes("--!nonstrict");
  if (!hasStrict) {
    issues.push({
      rule: "missing-strict",
      severity: "info",
      line: 1,
      message: "File does not declare a Luau type-checking mode.",
      suggestion: "Add --!strict (or --!nonstrict during migration) on line 1.",
    });
  }

  const errors = issues.filter((x) => x.severity === "error").length;
  const warnings = issues.filter((x) => x.severity === "warning").length;
  const infos = issues.filter((x) => x.severity === "info").length;
  const passed = errors === 0;

  const summary = passed
    ? `Passed with ${warnings} warning(s) and ${infos} info(s).`
    : `Failed: ${errors} error(s), ${warnings} warning(s), ${infos} info(s).`;

  return { passed, lines: lines.length, errors, warnings, infos, issues, summary };
}
