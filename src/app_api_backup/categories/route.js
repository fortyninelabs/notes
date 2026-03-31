import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, color } = await request.json();
    const id = uuidv4();
    
    const stmt = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)');
    stmt.run(id, name, color || '#3b82f6'); // Default Blue
    
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
