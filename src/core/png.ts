/**
 * GEORGE GUI @Search — dependency-free PNG encoder.
 *
 * Writes valid 8-bit RGB PNGs using only Node's built-in zlib, so the
 * thumbnail renderer works offline on any machine with zero native deps.
 */

import { deflateSync } from "node:zlib";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

/**
 * Encode raw RGB pixels (w*h*3 bytes, row-major) as a PNG buffer.
 */
export function encodePng(width: number, height: number, rgb: Uint8Array): Buffer {
  if (rgb.length !== width * height * 3) {
    throw new Error(`Pixel buffer size mismatch: expected ${width * height * 3}, got ${rgb.length}`);
  }

  // IHDR: width, height, bit depth 8, color type 2 (truecolor RGB),
  // compression 0, filter 0, interlace 0.
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Raw scanlines, each prefixed with filter byte 0 (None).
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Verify a buffer is a structurally valid PNG (signature + IHDR size). */
export function isPng(buf: Buffer): boolean {
  if (buf.length < 8 + 25) return false;
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return false;
  if (buf.toString("ascii", 12, 16) !== "IHDR") return false;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return width > 0 && height > 0;
}

export function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (!isPng(buf)) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
