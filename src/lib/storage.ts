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

export async function uploadBuffer(storagePath: string, buffer: Buffer, contentType: string) {
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

