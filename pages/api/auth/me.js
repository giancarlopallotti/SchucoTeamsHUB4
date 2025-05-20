// Percorso: /pages/api/auth/me.js

const cookie = require('cookie');

export default function handler(req, res) {
  // Parse cookies dalla richiesta
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const userCookie = cookies.user;

  if (!userCookie) {
    return res.status(401).json({ error: "Non autenticato" });
  }
  try {
    const user = JSON.parse(userCookie);
    // Restituisci solo i dati necessari
    return res.status(200).json({
      id: user.id,
      name: user.name,
      surname: user.surname,
      role: user.role,
      email: user.email,
      status: user.status,
      tags: user.tags,
      note: user.note
      // aggiungi altri campi se vuoi
    });
  } catch {
    return res.status(400).json({ error: "Cookie utente non valido" });
  }
}
