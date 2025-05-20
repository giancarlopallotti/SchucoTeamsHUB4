// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Errore login");
      }
    } catch (err) {
      setError("Errore di rete");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f4f6f8",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundImage: "url('/background-schueco.jpg')",
      backgroundSize: "cover",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>Accesso SchücoTeamsHUB</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 10 }}>Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 20 }}>Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
          </label>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          <button type="submit" style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#003d73",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}>Accedi</button>
        </form>
      </div>
    </div>
  );
}
