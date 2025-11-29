/**
 * Client-side watermark utility using Canvas API
 * Adds "NGX VISION" watermark to images for download/share
 */

interface WatermarkOptions {
  text?: string;
  opacity?: number;
  fontSize?: number;
}

/**
 * Adds watermark to an image and returns as Blob
 * @param imageUrl - URL of the image to watermark
 * @param options - Watermark configuration options
 * @returns Promise<Blob> - Watermarked image as JPEG blob
 */
export async function addWatermark(
  imageUrl: string,
  options: WatermarkOptions = {}
): Promise<Blob> {
  const {
    text = "NGX VISION",
    opacity = 0.7,
    fontSize = 24,
  } = options;

  // Load the image
  const img = await loadImage(imageUrl);

  // Create canvas with image dimensions
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Calculate scaled font size (3% of image width, minimum 24px)
  const scaledFontSize = Math.max(fontSize, img.width * 0.03);

  // Configure watermark text style
  ctx.font = `bold ${scaledFontSize}px "Inter", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  // Add shadow for better legibility on any background
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Calculate position (bottom-right with 3% padding)
  const padding = img.width * 0.03;
  const x = img.width - padding;
  const y = img.height - padding;

  // Draw watermark text
  ctx.fillText(text, x, y);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      "image/jpeg",
      0.92
    );
  });
}

/**
 * Loads an image from URL with CORS support
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Downloads an image with watermark
 * @param imageUrl - URL of the image to download
 * @param filename - Name for the downloaded file (without extension)
 */
export async function downloadWithWatermark(
  imageUrl: string,
  filename: string = "ngx-vision"
): Promise<void> {
  const blob = await addWatermark(imageUrl);

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
