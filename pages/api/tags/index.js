// /pages/api/tags/index.js
const db = require("../../../db/db.js");

module.exports = function handler(req, res) {
  if (req.method === "GET") {
    // Restituisce tutti i tag ordinati per label
    const tags = db.prepare("SELECT id, label FROM tags ORDER BY label ASC").all();
    res.status(200).json(tags);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Metodo non permesso");
  }
};
