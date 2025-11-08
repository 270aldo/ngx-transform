import { getBucket } from "./firebaseAdmin";

const ONE_HOUR = 60 * 60 * 1000;

export async function getSignedUrl(path: string, expiresInMs = ONE_HOUR) {
  const bucket = getBucket();
  const file = bucket.file(path);
  const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + expiresInMs });
  return url as string;
}

export async function copyFile(sourcePath: string, destinationPath: string) {
  const bucket = getBucket();
  const sourceFile = bucket.file(sourcePath);
  await sourceFile.copy(bucket.file(destinationPath));
  return destinationPath;
}

export async function deletePrefix(prefix: string) {
  try {
    const bucket = getBucket();
    await bucket.deleteFiles({ prefix, force: true }).catch((err: unknown) => {
      if ((err as { code?: number }).code !== 404) {
        throw err;
      }
    });
  } catch (err) {
    console.warn("deletePrefix", prefix, err);
  }
}
