// /pages/api/projects/index.js
import db from "../../../db/db";

export default function handler(req, res) {
  if (req.method === "GET") {
    // Restituisce tutti i progetti
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.status(200).json(projects);
  } else if (req.method === "POST") {
    // Aggiunge un nuovo progetto
    const { title, description, status, priority, deadline, note } = req.body;
    if (!title) {
      res.status(400).json({ message: "Il titolo è obbligatorio" });
      return;
    }
    const stmt = db.prepare(
      "INSERT INTO projects (title, description, status, priority, deadline, note, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'))"
    );
    const result = stmt.run(
      title,
      description || "",
      status || "da iniziare",
      priority || "",
      deadline || "",
      note || ""
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
