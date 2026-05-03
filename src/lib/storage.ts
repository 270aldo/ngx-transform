import { getBucket } from "./firebaseAdmin";

export async function downloadFileBuffer(storagePath: string): Promise<{ buffer: Buffer; contentType?: string }> {
  const file = getBucket().file(storagePath);
  const [metadata] = await file.getMetadata();
  const [buffer] = await file.download();
  return { buffer, contentType: metadata.contentType };
}

export async function getSignedUrl(storagePath: string, opts?: { expiresInSeconds?: number }): Promise<string> {
  const file = getBucket().file(storagePath);
  const expires = Date.now() + (opts?.expiresInSeconds ?? 3600) * 1000;
  const [url] = await file.getSignedUrl({ action: "read", expires });
  return url;
}

/**
 * Detect image MIME type from buffer magic bytes.
 * Returns null if format cannot be identified — does NOT mean invalid,
 * just that we couldn't sniff (e.g., SVG, raw, or future formats).
 *
 * Added in AUDIT-022 as defense-in-depth: storage.rules already
 * enforces image/* but a buffer-level check catches mislabeled
 * uploads before they ever reach Cloud Storage.
 */
export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return "image/png";
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  // WebP: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return "image/webp";
  // GIF: "GIF87a" or "GIF89a"
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
  ) return "image/gif";
  // HEIC: ftyp box at byte 4
  if (
    buffer.length >= 12 &&
    buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70
  ) {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "heic" || brand === "heix" || brand === "mif1") return "image/heic";
  }
  return null;
}

export async function uploadBuffer(storagePath: string, buffer: Buffer, contentType: string) {
  // Defense in depth: when caller declares image/*, sniff magic bytes
  // and reject mismatches. storage.rules also enforces image/* but
  // doesn't validate buffer contents (only the metadata header).
  if (contentType.startsWith("image/")) {
    const detected = detectImageMime(buffer);
    if (detected && detected !== contentType) {
      throw new Error(
        `MIME mismatch: declared ${contentType} but buffer is ${detected}`
      );
    }
    // detected===null is OK (could be SVG or unrecognized); we accept
    // the declared contentType under the trust of upstream validation
    // (Zod in routes + storage.rules at write time).
  }

  const file = getBucket().file(storagePath);
  await file.save(buffer, {
    contentType,
    resumable: false,
    public: false,
    metadata: { cacheControl: "no-cache, no-store, must-revalidate" },
  });
  return storagePath;
}

export async function deletePath(storagePath: string) {
  const file = getBucket().file(storagePath);
  await file.delete({ ignoreNotFound: true });
}

export async function deletePrefix(prefix: string) {
  const [files] = await getBucket().getFiles({ prefix });
  await Promise.all(files.map((f) => f.delete({ ignoreNotFound: true })));
}

