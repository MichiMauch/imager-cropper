import { NextRequest, NextResponse } from 'next/server';
import { deleteCustomShape } from '../../../lib/turso';

// DELETE - Delete a custom shape by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Shape ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteCustomShape(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Shape not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Shape deleted successfully' 
    });

  } catch (error) {
    console.error('API Error - DELETE shape:', error);
    return NextResponse.json(
      { error: 'Failed to delete shape' },
      { status: 500 }
    );
  }
}