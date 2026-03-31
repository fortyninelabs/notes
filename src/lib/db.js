const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// DEV → Projektordner
// PROD → Electron userData (kommt aus main.js)
const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'notes.db');

console.log("DB PATH:", dbPath);

// Prüfen, ob DB existiert
const dbExists = fs.existsSync(dbPath);

// DB öffnen
let db = new Database(dbPath);

// Schema erstellen
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    categoryId TEXT,
    favorite INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories (id)
  );
`);

// Welcome-Note nur beim ersten Start
if (!dbExists) {
  const welcomeId = uuidv4();
  const welcomeContent = `
<h1>Willkommen</h1>

<p>Schön, dass du da bist. Diese App wurde entwickelt, um dir einen ruhigen, klaren Ort für deine Gedanken zu geben – ohne Ablenkung, ohne Komplexität und ohne Kompromisse beim Datenschutz.</p>

<p>Alles, was du hier erstellst, bleibt auf deinem Gerät. Lokal gespeichert, geschützt und vollständig unter deiner Kontrolle. Keine Cloud‑Dienste. Keine versteckten Prozesse. Keine Daten, die dein Gerät verlassen.</p>


<h2>Was dich erwartet</h2>

<ul>
  <li>Eine klare, reduzierte Oberfläche</li>
  <li>Sofortiges Speichern – ohne Wartezeit</li>
  <li>Lokale Datenhaltung in einem geschützten Bereich deines Benutzerprofils</li>
  <li>Kategorien, Favoriten und eine strukturierte Übersicht</li>
  <li>Eine moderne, macOS‑inspirierte Benutzererfahrung</li>
  <li>Intuitive Bedienung mit hilfreichen Tastenkürzeln</li>
</ul>


<h2>In Entwicklung</h2>

<p>Diese App wächst weiter. Schritt für Schritt entsteht ein Werkzeug, das dir maximale Kontrolle und Transparenz bietet.</p>

<p>Geplant sind:</p>

<ul>
  <li><strong>Versionierung deiner Inhalte</strong>, um Änderungen jederzeit nachvollziehen zu können</li>
  <li><strong>End‑to‑End‑Verschlüsselung</strong> der lokalen Datenbank</li>
  <li><strong>Optionale Synchronisation über Schweizer oder deutsche Server</strong>, technisch so gestaltet, dass kein Lesezugriff möglich ist – weder jetzt noch in Zukunft</li>
  <li>Eine vollständig <strong>DSGVO‑konforme Architektur</strong>, ohne Tracking, ohne Telemetrie, ohne Datenabfluss</li>
</ul>


<h2>Deine erste Notiz</h2>

<p>Dies ist deine erste Notiz. Du kannst sie jederzeit bearbeiten, umbenennen oder löschen – genau wie jede andere Notiz, die du hier erstellst.</p>

<p>Viel Freude beim Schreiben und Ordnen deiner Gedanken.</p>


`;

  db.prepare(`
    INSERT INTO notes (id, title, content)
    VALUES (?, ?, ?)
  `).run(welcomeId, "Willkommen", welcomeContent);

  console.log("Welcome note created.");
}

module.exports = db;


