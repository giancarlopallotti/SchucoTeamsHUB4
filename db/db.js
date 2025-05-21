// /db/db.js v2 - 20/05/2025 - Percorso DB sempre dalla root progetto
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(process.cwd(), 'schucohub.sqlite'); // <-- cambia qui
console.log('USO QUESTO DB:', dbPath);

const db = new Database(dbPath);
module.exports = db;
