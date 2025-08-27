import { Point } from './shapes';

export function generateShapePreview(points: Point[], canvasSize: { width: number; height: number }, size: number = 50): string {
  // Create a small canvas for the preview
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx || points.length < 3) {
    return ''; // Return empty string if no context or not enough points
  }
  
  canvas.width = size;
  canvas.height = size;
  
  // Calculate scaling to fit the shape in the preview canvas
  const scaleX = size / canvasSize.width;
  const scaleY = size / canvasSize.height;
  
  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY) * 0.8; // 0.8 for some padding
  
  // Calculate offset to center the shape
  const offsetX = (size - canvasSize.width * scale) / 2;
  const offsetY = (size - canvasSize.height * scale) / 2;
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Draw shape
  ctx.beginPath();
  ctx.strokeStyle = '#3B82F6'; // Blue color
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Light blue fill
  ctx.lineWidth = 2;
  
  // Scale and translate points
  const scaledPoints = points.map(point => ({
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY
  }));
  
  // Draw the shape path
  ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
  
  for (let i = 1; i < scaledPoints.length; i++) {
    ctx.lineTo(scaledPoints[i].x, scaledPoints[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Convert canvas to base64 data URL
  return canvas.toDataURL('image/png');
}

export function createShapePreviewElement(previewDataUrl: string): HTMLImageElement {
  const img = new Image();
  img.src = previewDataUrl;
  img.width = 50;
  img.height = 50;
  img.style.borderRadius = '4px';
  return img;
}