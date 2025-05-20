// /db/db.js
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, '../schucohub.sqlite');
console.log('USO QUESTO DB:', dbPath);

const db = new Database(dbPath);
module.exports = db;
