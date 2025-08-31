import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomShapes, saveCustomShape, deleteAllCustomShapes } from '../../lib/turso';

// GET - Fetch all custom shapes
export async function GET() {
  try {
    const shapes = await getAllCustomShapes();
    return NextResponse.json({ shapes });
  } catch (error) {
    console.error('API Error - GET shapes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shapes' },
      { status: 500 }
    );
  }
}

// POST - Save a new custom shape
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.points || !body.canvas_size) {
      return NextResponse.json(
        { error: 'Missing required fields: name, points, canvas_size' },
        { status: 400 }
      );
    }

    // Validate points array
    if (!Array.isArray(body.points) || body.points.length < 3) {
      return NextResponse.json(
        { error: 'Points must be an array with at least 3 points' },
        { status: 400 }
      );
    }

    // Validate canvas_size object
    if (!body.canvas_size.width || !body.canvas_size.height) {
      return NextResponse.json(
        { error: 'Canvas size must include width and height' },
        { status: 400 }
      );
    }

    const shapeId = await saveCustomShape({
      name: body.name,
      points: body.points,
      canvas_size: body.canvas_size,
      category: body.category || 'Custom',
      description: body.description || '',
      icon: body.icon || '🎨',
      created_by: body.created_by || 'User',
      is_standard: body.is_standard || false
    });

    return NextResponse.json({ 
      success: true, 
      id: shapeId,
      message: 'Shape saved successfully' 
    });

  } catch (error) {
    console.error('API Error - POST shape:', error);
    return NextResponse.json(
      { error: 'Failed to save shape' },
      { status: 500 }
    );
  }
}

// DELETE - Delete all custom shapes (use with caution!)
export async function DELETE() {
  try {
    const deleted = await deleteAllCustomShapes();
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deleted} shapes from database` 
    });
  } catch (error) {
    console.error('API Error - DELETE shapes:', error);
    return NextResponse.json(
      { error: 'Failed to delete shapes' },
      { status: 500 }
    );
  }
}