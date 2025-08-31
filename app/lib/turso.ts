import { createClient } from '@libsql/client';

// Turso client configuration - only create if environment variables are present
export const turso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN 
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : null;

// Type definitions for custom shapes
export interface CustomShape {
  id: string;
  name: string;
  points: Array<{x: number, y: number}>;
  canvas_size: {width: number, height: number};
  category?: string;
  description?: string;
  icon?: string;
  created_at?: string;
  created_by?: string;
  is_standard?: boolean;
}

// Database operations
export async function getAllCustomShapes(): Promise<CustomShape[]> {
  if (!turso) {
    console.warn('Turso client not configured - returning empty shapes list');
    return [];
  }
  
  try {
    const result = await turso.execute('SELECT * FROM custom_shapes ORDER BY is_standard DESC, created_at DESC');
    
    const shapes = result.rows.map(row => {
      return {
        id: row.id as string,
        name: row.name as string,
        points: JSON.parse(row.points as string),
        canvas_size: JSON.parse(row.canvas_size as string),
        category: row.category as string || 'Custom',
        description: row.description as string || '',
        icon: row.icon as string || '🎨',
        created_at: row.created_at as string,
        created_by: row.created_by as string || '',
        is_standard: Boolean(row.is_standard)
      };
    });
    
    return shapes;
  } catch (error) {
    console.error('Failed to fetch custom shapes:', error);
    return [];
  }
}

export async function saveCustomShape(shape: Omit<CustomShape, 'id' | 'created_at'>): Promise<string> {
  if (!turso) {
    throw new Error('Turso client not configured');
  }
  
  const id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    await turso.execute({
      sql: `INSERT INTO custom_shapes 
            (id, name, points, canvas_size, category, description, icon, created_by, is_standard) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        shape.name,
        JSON.stringify(shape.points),
        JSON.stringify(shape.canvas_size),
        shape.category || 'Custom',
        shape.description || '',
        shape.icon || '🎨',
        shape.created_by || 'User',
        shape.is_standard ? 1 : 0
      ]
    });
    
    return id;
  } catch (error) {
    console.error('Failed to save custom shape:', error);
    throw new Error('Failed to save shape to database');
  }
}

export async function deleteCustomShape(id: string): Promise<boolean> {
  if (!turso) {
    return false;
  }
  
  try {
    const result = await turso.execute({
      sql: 'DELETE FROM custom_shapes WHERE id = ?',
      args: [id]
    });
    
    return result.rowsAffected > 0;
  } catch (error) {
    console.error('Failed to delete custom shape:', error);
    return false;
  }
}

export async function deleteAllCustomShapes(): Promise<number> {
  if (!turso) {
    throw new Error('Turso client not configured');
  }
  
  try {
    const result = await turso.execute('DELETE FROM custom_shapes');
    return result.rowsAffected || 0;
  } catch (error) {
    console.error('Failed to delete all custom shapes:', error);
    throw new Error('Failed to delete shapes from database');
  }
}

export async function getShapesByCategory(): Promise<Record<string, CustomShape[]>> {
  const shapes = await getAllCustomShapes();
  const categories: Record<string, CustomShape[]> = {};
  
  shapes.forEach(shape => {
    const category = shape.category || 'Custom';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(shape);
  });
  
  return categories;
}

export async function searchShapes(query: string): Promise<CustomShape[]> {
  if (!turso) {
    return [];
  }
  
  try {
    const result = await turso.execute({
      sql: `SELECT * FROM custom_shapes 
            WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
            ORDER BY created_at DESC`,
      args: [`%${query}%`, `%${query}%`, `%${query}%`]
    });
    
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      points: JSON.parse(row.points as string),
      canvas_size: JSON.parse(row.canvas_size as string),
      category: row.category as string || 'Custom',
      description: row.description as string || '',
      icon: row.icon as string || '🎨',
      created_at: row.created_at as string,
      created_by: row.created_by as string || '',
      is_standard: Boolean(row.is_standard)
    }));
  } catch (error) {
    console.error('Failed to search custom shapes:', error);
    return [];
  }
}