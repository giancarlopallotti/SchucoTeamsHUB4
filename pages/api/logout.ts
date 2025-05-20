// pages/api/logout.js
export default function handler(req, res) {
  res.setHeader('Set-Cookie', [
    // Svuota il cookie token
    `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
  ]);
  res.status(200).json({ message: "Logout effettuato" });
}
