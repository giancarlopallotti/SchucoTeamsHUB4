// pages/api/dashboard.jsimport db from "../../db/db.js";


export default function handler(req, res) {
  try {
    res.status(200).json({ message: "API Dashboard attiva" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore generico" });
  }
}