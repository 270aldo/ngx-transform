/**
 * Share Messages - Viral Optimization Sprint v2.1
 *
 * Platform-specific share templates with dynamic content.
 */

export interface ShareData {
  shareUrl: string;
  resultAdjective: string;
  userName?: string;
  stats?: {
    strength?: number;
    aesthetics?: number;
    energy?: number;
  };
}

export function getResultAdjective(stats?: ShareData["stats"]): string {
  if (!stats) return "impresionante";

  if (stats.strength && stats.strength > 80) return "brutal";
  if (stats.aesthetics && stats.aesthetics > 80) return "increíble";
  if (stats.energy && stats.energy > 80) return "imparable";

  return "impresionante";
}

export const shareTemplates = {
  whatsapp: {
    getText: (data: ShareData) =>
      `Acabo de ver cómo me veré en 12 meses con IA.

Spoiler: Mi yo futuro se ve ${data.resultAdjective}.

¿Quieres ver el tuyo?
${data.shareUrl}`,
    getUrl: (data: ShareData) =>
      `https://wa.me/?text=${encodeURIComponent(
        shareTemplates.whatsapp.getText(data)
      )}`,
  },

  instagram: {
    getText: (data: ShareData) =>
      `Mi transformación de 12 meses según la IA

Descubre la tuya: ${data.shareUrl}`,
    // Instagram doesn't support direct share, copy to clipboard
    getUrl: () => null,
  },

  twitter: {
    getText: (data: ShareData) =>
      `Acabo de ver mi yo de 12 meses con @NGXGenesis

La IA dice que puedo lograrlo. ¿Tú?

${data.shareUrl}`,
    getUrl: (data: ShareData) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareTemplates.twitter.getText(data)
      )}`,
  },

  facebook: {
    getText: () => "",
    getUrl: (data: ShareData) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        data.shareUrl
      )}`,
  },

  copy: {
    getText: (data: ShareData) => data.shareUrl,
    getUrl: () => null,
  },
};

export type SharePlatform = keyof typeof shareTemplates;

export function buildShareData(
  shareId: string,
  stats?: ShareData["stats"],
  userName?: string
): ShareData {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://transform.ngxgenesis.com";

  return {
    shareUrl: `${baseUrl}/s/${shareId}`,
    resultAdjective: getResultAdjective(stats),
    userName,
    stats,
  };
}

export function getShareUrl(platform: SharePlatform, data: ShareData): string | null {
  return shareTemplates[platform].getUrl(data);
}

export function getShareText(platform: SharePlatform, data: ShareData): string {
  return shareTemplates[platform].getText(data);
}
