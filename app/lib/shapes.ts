export interface Point {
  x: number;
  y: number;
}

export type ShapeTemplate = {
  id: string;
  name: string;
  icon: string;
  drawPath: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  isCustom?: boolean;
  customPoints?: Point[];
  category?: string;
  description?: string;
  canvasSize?: { width: number; height: number };
  is_standard?: boolean;
};

// Only keep the custom shape template for creating new shapes
export const shapes: ShapeTemplate[] = [
  {
    id: 'custom',
    name: 'Draw Custom Shape',
    icon: '✏️',
    drawPath: (ctx, width, height) => {
      // This will be overridden when custom points are provided
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.closePath();
    },
    isCustom: true
  }
];

export function createCustomShape(points: Point[], canvasWidth: number, canvasHeight: number): ShapeTemplate {
  return {
    id: 'custom',
    name: 'Custom Shape',
    icon: '✏️',
    isCustom: true,
    customPoints: points,
    drawPath: (ctx, width, height) => {
      if (!points || points.length < 3) return;
      
      ctx.beginPath();
      
      // Scale points to target canvas size
      const scaleX = width / canvasWidth;
      const scaleY = height / canvasHeight;
      
      const scaledPoints = points.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY
      }));
      
      ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      
      for (let i = 1; i < scaledPoints.length; i++) {
        ctx.lineTo(scaledPoints[i].x, scaledPoints[i].y);
      }
      
      ctx.closePath();
    }
  };
}

