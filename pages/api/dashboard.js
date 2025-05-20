// pages/api/dashboard.js
import db from "../../db/db.js";
import { parse } from "cookie";

export default function handler(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) return res.status(401).json({ error: "Non autorizzato" });

  try {
    res.status(200).json({ message: "API Dashboard attiva" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore generico" });
  }
}