// Percorso: /pages/api/auth/login.js

import db from "../../../db/db.js";
import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Metodo non permesso");
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e password obbligatorie" });
  }

  try {
    // LOG DI DEBUG
    console.log("Tentativo login per:", email, password);

    // Tenta la query
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    console.log("Utente trovato dal db:", user);

    if (!user) return res.status(401).json({ error: "Credenziali non valide" });

    // Serializza info utente (NON inserire password)
    const userObj = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      status: user.status,
      tags: user.tags,
      note: user.note
    };

    // Cookie user (per UI e /me)
    const userCookie = serialize("user", JSON.stringify(userObj), {
      httpOnly: false, // accessibile lato client e API route
      path: "/",
      maxAge: 60 * 60 * 8 // 8 ore
    });

    // Cookie token (compatibilità/vecchie API, solo id utente)
    const tokenCookie = serialize("token", user.id.toString(), {
      httpOnly: true, // accessibile solo dal server/API
      path: "/",
      maxAge: 60 * 60 * 8
    });

    // Imposta entrambi
    res.setHeader("Set-Cookie", [userCookie, tokenCookie]);
    res.status(200).json({ message: "Login riuscito" });
  } catch (err) {
    // LOG ERRORE
    console.error("ERRORE INTERNO LOGIN:", err);
    res.status(500).json({ error: "Errore interno login" });
  }
}