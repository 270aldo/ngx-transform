import { timingSafeEqual } from "crypto";

/**
 * Safely compares two strings using a constant-time algorithm to prevent timing attacks.
 * @param a The first string
 * @param b The second string
 * @returns boolean indicating if the strings are equal
 */
export function secureCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    // Waste time to mitigate length-discovery timing attacks
    timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}
