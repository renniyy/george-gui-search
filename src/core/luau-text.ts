/**
 * GEORGE GUI @Search — Luau text canonicalization.
 *
 * Every Luau string leaving this package passes through these two passes:
 *
 *   1. normalizeLuauIndent — leading 8-space groups become tabs, so output is
 *      byte-stable regardless of authoring environment.
 *   2. canonicalizeLuau — StyLua-canonical layout: inside multiline table
 *      constructors each property sits on its own line with a trailing comma,
 *      and statement lines never carry stray commas. The pass is
 *      depth-aware (braces, parens, strings and comments) so wrapped
 *      function signatures and function-valued fields are never mangled.
 */

const STRING_LITERAL = /"(?:[^"\\\n]|\\.)*"/g;
const PROP_LINE = /^([\t ]+)([A-Za-z_][A-Za-z0-9_.\ [\]"']*)\s*=\s/;
const PROP_SPLIT = /,\s+(?=[A-Z][A-Za-z0-9_]*\s*=\s)/;

export function normalizeLuauIndent(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const match = /^((?: {8})+)(.*)$/.exec(line);
      if (!match) return line;
      return "\t".repeat(match[1].length / 8) + match[2];
    })
    .join("\n");
}

/** Strip string literals and comments so brace/paren counting is accurate. */
function structural(line: string): string {
  let s = line.replace(STRING_LITERAL, '""');
  const comment = s.indexOf("--");
  if (comment !== -1) s = s.slice(0, comment);
  return s;
}

function indentOf(line: string): number {
  let n = 0;
  while (line[n] === "\t" || line[n] === " ") n += 1;
  return n;
}

function isPropLine(line: string): boolean {
  return PROP_LINE.test(line) && !line.trimStart().startsWith("local ");
}

export function canonicalizeLuau(source: string): string {
  const lines = source.split("\n");
  const out: string[] = [];
  let brace = 0;
  let paren = 0;
  let functionDepth = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const bare = structural(line);
    const dBrace = (bare.match(/\{/g)?.length ?? 0) - (bare.match(/\}/g)?.length ?? 0);
    const dParen = (bare.match(/\(/g)?.length ?? 0) - (bare.match(/\)/g)?.length ?? 0);
    const inConstructor = brace > 0 && functionDepth === 0;

    if (inConstructor && isPropLine(line)) {
      const indent = line.slice(0, indentOf(line));
      const parts = line.trimEnd().split(PROP_SPLIT);
      if (parts.length > 1) {
        // Multi-property line: one property per line, each with a trailing comma.
        for (const part of parts) {
          let p = part.trim();
          if (!p.endsWith(",") && !p.endsWith("{")) p += ",";
          out.push(indent + p);
        }
      } else {
        // Single property line: ensure a trailing comma unless it opens a
        // function/table value whose body follows on deeper lines.
        let s = line.trimEnd();
        if (!s.endsWith(",") && !s.endsWith("{")) {
          let next = i + 1;
          while (next < lines.length && lines[next].trim() === "") next += 1;
          const follower = lines[next];
          const followerIndent = follower !== undefined ? indentOf(follower) : -1;
          const opensNested = follower !== undefined && followerIndent > indentOf(line);
          if (!opensNested) s += ",";
        }
        out.push(s);
      }
    } else if (brace === 0) {
      // Statement level (including inside call arguments): a trailing comma on
      // an assignment line is never valid Luau — strip it.
      const s = line.trimEnd();
      const isAssignment = /^[\t ]*(?:local \w[^=]*=|[A-Za-z_][\w.\[\]"':]*\s*=)/.test(s);
      if (s.endsWith(",") && isAssignment) {
        out.push(s.slice(0, -1));
      } else {
        out.push(line);
      }
    } else {
      out.push(line);
    }

    // Track function bodies opened by function-valued fields so their
    // statement lines are never treated as table entries.
    if (/=\s*function\s*\(/.test(bare)) functionDepth += 1;
    if (/^\s*end\s*,?\s*$/.test(line)) functionDepth = Math.max(0, functionDepth - 1);

    brace = Math.max(0, brace + dBrace);
    paren = Math.max(0, paren + dParen);
  }

  return out.join("\n");
}

/** Full pipeline applied to every emitted Luau string. */
export function finalizeLuau(source: string): string {
  return canonicalizeLuau(normalizeLuauIndent(source))
    // At most one blank line in a row (StyLua collapses runs of blanks).
    .replace(/\n{3,}/g, "\n\n");
}
