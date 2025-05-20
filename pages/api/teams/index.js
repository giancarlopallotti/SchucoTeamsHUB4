// /pages/api/teams/index.js
const db = require("../../../db/db.js");

module.exports = function handler(req, res) {
  if (req.method === "GET") {
    // Restituisce tutti i team ordinati per id
    const teams = db.prepare("SELECT id, name, description, created_at FROM teams ORDER BY id DESC").all();
    res.status(200).json(teams);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Metodo non permesso");
  }
};
