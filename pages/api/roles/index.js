// /pages/api/roles/index.js
const db = require("../../../db/db.js");

module.exports = function handler(req, res) {
  if (req.method === "GET") {
    const roles = db.prepare("SELECT id, name FROM roles ORDER BY name ASC").all();
    res.status(200).json(roles);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Metodo non permesso");
  }
};
