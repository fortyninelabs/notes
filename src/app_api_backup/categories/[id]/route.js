import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, color } = await request.json();
    
    let fields = [];
    let values = [];
    
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (color !== undefined) { fields.push('color = ?'); values.push(color); }
    
    values.push(id);
    const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    
    db.prepare(query).run(...values);
    
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if category is used by any notes
    const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes WHERE categoryId = ?').get(id).count;
    if (noteCount > 0) {
      // Option 1: Prevent deletion
      // return NextResponse.json({ error: 'Category is in use' }, { status: 400 });
      // Option 2: Set categoryId to NULL for those notes
      db.prepare('UPDATE notes SET categoryId = NULL WHERE categoryId = ?').run(id);
    }
    
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
