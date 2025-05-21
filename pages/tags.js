// /pages/tags.js (versione migliorata)
// Adatta fetch e logica in base alla tua API reale!

import { useState, useEffect } from "react";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Carica TAGs al mount
  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.json())
      .then(data => setTags(data || []));
  }, []);

  // Gestione inserimento nuovo TAG
  const handleAddTag = async () => {
    const tag = newTag.trim().toUpperCase();
    if (!tag) return setMessage("Inserisci un TAG valido");
    if (tags.some(t => t.name === tag)) return setMessage("TAG già esistente!");
    setLoading(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tag }),
    });
    setLoading(false);
    if (res.ok) {
      setTags([...tags, { name: tag }]);
      setMessage("TAG aggiunto!");
      setNewTag("");
    } else {
      setMessage("Errore inserimento TAG");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f6f8fc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 40
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 22,
        boxShadow: "0 4px 18px #0002",
        minWidth: 360,
        maxWidth: 540,
        padding: 36,
        marginBottom: 32
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#182764",
          letterSpacing: 0.5,
          marginBottom: 22
        }}>Gestione TAGS Globali</h1>

        <div style={{ marginBottom: 30, display: "flex", gap: 12, alignItems: "center" }}>
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value.toUpperCase())}
            placeholder="Nuovo TAG (solo MAIUSCOLO)"
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #dbeafe",
              fontSize: 16,
              flex: 1,
              outline: "none"
            }}
            maxLength={24}
          />
          <button
            disabled={loading}
            onClick={handleAddTag}
            style={{
              background: "#00713f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              padding: "10px 22px",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1
            }}>
            {loading ? "Attendi..." : "Aggiungi TAG"}
          </button>
        </div>
        {message && <div style={{ color: "#00713f", marginBottom: 18, fontWeight: 600 }}>{message}</div>}

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 600, marginBottom: 7, fontSize: 17 }}>TAG disponibili:</div>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 6
          }}>
            {tags.length === 0 && <span style={{ color: "#aaa" }}>Nessun TAG presente</span>}
            {tags.map((tag, i) =>
              <span key={i} style={{
                background: "#e3f6ed",
                color: "#00713f",
                fontWeight: 700,
                borderRadius: 12,
                padding: "7px 16px",
                fontSize: 15,
                marginBottom: 6,
                boxShadow: "0 2px 8px #00713f11"
              }}>
                {tag.name}
              </span>
            )}
          </div>
        </div>

        {/* Sezione assegnazione tag */}
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Assegna TAG a entità</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gap: 12,
            marginTop: 8,
            alignItems: "center"
          }}>
            <div><b>Seleziona TAG...</b></div>
            <div>Files:</div>
            <div>Progetti:</div>
            <div>Clienti:</div>
            <div>Team:</div>
          </div>
        </div>
      </div>
    </div>
  );
}
