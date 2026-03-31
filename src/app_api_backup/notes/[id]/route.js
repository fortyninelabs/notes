import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { title, content, categoryId, favorite, deleted } = await request.json();
    const now = new Date().toISOString();
    
    // Dynamically build the update query
    let fields = ['updatedAt = ?'];
    let values = [now];
    
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (content !== undefined) { fields.push('content = ?'); values.push(content); }
    if (categoryId !== undefined) { fields.push('categoryId = ?'); values.push(categoryId); }
    if (favorite !== undefined) { fields.push('favorite = ?'); values.push(favorite ? 1 : 0); }
    if (deleted !== undefined) { fields.push('deleted = ?'); values.push(deleted ? 1 : 0); }
    
    values.push(id);
    const query = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`;
    
    db.prepare(query).run(...values);
    
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
