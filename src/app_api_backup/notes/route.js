import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const notes = db.prepare('SELECT * FROM notes ORDER BY updatedAt DESC').all();
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content, categoryId } = await request.json();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO notes (id, title, content, categoryId, favorite, deleted, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 0, 0, ?, ?)
    `);
    
    stmt.run(id, title || 'Untitled', content || '', categoryId || null, now, now);
    
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
