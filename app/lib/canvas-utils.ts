import { ShapeTemplate } from './shapes';

export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

export function cropImageWithShape(
  image: HTMLImageElement,
  shape: ShapeTemplate,
  outputSize: number = 512,
  useOriginalSize: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Set canvas size - use original image dimensions for custom shapes
  const canvasWidth = useOriginalSize ? image.width : outputSize;
  const canvasHeight = useOriginalSize ? image.height : outputSize;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // First, draw the full image
  if (useOriginalSize) {
    // For custom shapes with original size: draw image at 1:1 scale
    ctx.drawImage(image, 0, 0, image.width, image.height);
  } else {
    // For predefined shapes: scale image to fit square canvas
    const imageAspect = image.width / image.height;
    const canvasAspect = 1; // Square canvas
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imageAspect > canvasAspect) {
      // Image is wider - fit height and crop width
      drawHeight = outputSize;
      drawWidth = outputSize * imageAspect;
      offsetX = -(drawWidth - outputSize) / 2;
      offsetY = 0;
    } else {
      // Image is taller - fit width and crop height
      drawWidth = outputSize;
      drawHeight = outputSize / imageAspect;
      offsetX = 0;
      offsetY = -(drawHeight - outputSize) / 2;
    }
    
    // Draw the image
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }
  
  // Now cut out the shape area (make it transparent)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  
  // Draw the shape path to cut it out
  shape.drawPath(ctx, canvasWidth, canvasHeight);
  ctx.fill();
  
  ctx.restore();
  
  return canvas;
}

// Convenience function for original size cropping
export function cropImageWithOriginalSize(
  image: HTMLImageElement,
  shape: ShapeTemplate
): HTMLCanvasElement {
  return cropImageWithShape(image, shape, 512, true);
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/png'
    );
  });
}

export function downloadImage(blob: Blob, filename: string = 'cropped-image.png'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}