const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const seed = () => {
  // Clear existing data
  db.exec('DELETE FROM notes; DELETE FROM categories;');

  const categories = [
    { id: uuidv4(), name: 'Work', color: '#3b82f6' },
    { id: uuidv4(), name: 'Personal', color: '#10b981' },
    { id: uuidv4(), name: 'Ideas', color: '#f59e0b' },
    { id: uuidv4(), name: 'Journal', color: '#ec4899' },
  ];

  const catStmt = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)');
  categories.forEach(c => catStmt.run(c.id, c.name, c.color));

  const notes = [
    {
      id: uuidv4(),
      title: 'Project Roadmap 2026',
      content: '<h1>Project Roadmap 2026</h1><p>Our goal for this year is to build the most premium notes application ever. Key features include:</p><ul><li>3-column layout</li><li>Tiptap rich-text editor</li><li>macOS inspired design</li><li>Local SQLite storage</li></ul>',
      categoryId: categories[0].id,
      favorite: 1
    },
    {
      id: uuidv4(),
      title: 'Grocery List',
      content: '<h1>Grocery List</h1><p>Don\'t forget these essentials:</p><ul><li>Oat milk</li><li>Avocados</li><li>Sourdough bread</li><li>Coffee beans (very important!)</li></ul>',
      categoryId: categories[1].id,
      favorite: 0
    },
    {
      id: uuidv4(),
      title: 'Random Idea #42',
      content: '<h1>Random Idea #42</h1><p>What if we combined a note-taking app with a weather forecast? <i>Just kidding... or am I?</i></p>',
      categoryId: categories[2].id,
      favorite: 0
    }
  ];

  const noteStmt = db.prepare(`
    INSERT INTO notes (id, title, content, categoryId, favorite, deleted, updatedAt)
    VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
  `);
  
  notes.forEach(n => noteStmt.run(n.id, n.title, n.content, n.categoryId, n.favorite));

  console.log('Database seeded successfully!');
};

seed();
process.exit(0);
