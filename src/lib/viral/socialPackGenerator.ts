/**
 * PR-3: Social Pack Generator
 *
 * Generates multiple image formats for social sharing:
 * - Story (9:16) - Instagram/TikTok stories
 * - Post (4:5) - Instagram feed
 * - Square (1:1) - Universal
 *
 * Uses sharp for image processing
 */

export interface SocialPackFormat {
  name: string;
  width: number;
  height: number;
  ratio: string;
  description: string;
}

export const SOCIAL_PACK_FORMATS: SocialPackFormat[] = [
  {
    name: "story",
    width: 1080,
    height: 1920,
    ratio: "9:16",
    description: "Instagram/TikTok Stories",
  },
  {
    name: "post",
    width: 1080,
    height: 1350,
    ratio: "4:5",
    description: "Instagram Feed",
  },
  {
    name: "square",
    width: 1080,
    height: 1080,
    ratio: "1:1",
    description: "Universal Square",
  },
];

/**
 * Type for social pack result
 */
export interface SocialPackResult {
  story: string; // base64 or URL
  post: string;
  square: string;
}

/**
 * Generate social pack URLs
 * Returns URLs that can be used to download images in different formats
 */
export function getSocialPackDownloadUrls(
  shareId: string,
  baseUrl?: string
): Record<string, string> {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "";

  return {
    story: `${base}/api/social-pack/${shareId}?format=story`,
    post: `${base}/api/social-pack/${shareId}?format=post`,
    square: `${base}/api/social-pack/${shareId}?format=square`,
  };
}

/**
 * Get format config by name
 */
export function getFormatConfig(formatName: string): SocialPackFormat | null {
  return SOCIAL_PACK_FORMATS.find((f) => f.name === formatName) || null;
}

/**
 * Validate format name
 */
export function isValidFormat(formatName: string): boolean {
  return SOCIAL_PACK_FORMATS.some((f) => f.name === formatName);
}
