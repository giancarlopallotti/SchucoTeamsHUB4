// /pages/api/auth/logout.js
import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Metodo non permesso");
  }

  // Svuota il cookie di sessione (nome: 'token' o quello usato nel login)
  res.setHeader("Set-Cookie", serialize("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // scade subito
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }));

  return res.status(200).json({ message: "Logout effettuato" });
}
