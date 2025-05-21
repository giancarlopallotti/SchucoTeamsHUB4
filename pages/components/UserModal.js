// Percorso: /pages/components/UserModal.js

import { useEffect, useState } from "react";
import Select from "react-select";

export default function UserModal({ user = {}, onClose, onSave }) {
  const [form, setForm] = useState({
    id: user.id,
    name: user.name || "",
    surname: user.surname || "",
    email: user.email || "",
    password: "",
    phone: user.phone || "",
    address: user.address || "",
    note: user.note || "",
    role: user.role || "",
    status: user.status || "attivo",
    tags: user.tags
      ? (typeof user.tags === "string"
        ? user.tags.split(",").map(t => t.trim()).filter(Boolean)
        : user.tags)
      : [],
  });

  const [tagOptions, setTagOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.json())
      .then(tags => setTagOptions(
        tags.map(t => ({
          value: t.name || t.label,
          label: t.name || t.label,
        }))
      ));
  }, []);

  useEffect(() => {
    setForm(f => ({
      ...f,
      id: user.id,
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      address: user.address || "",
      note: user.note || "",
      role: user.role || "",
      status: user.status || "attivo",
      tags: user.tags
        ? (typeof user.tags === "string"
          ? user.tags.split(",").map(t => t.trim()).filter(Boolean)
          : user.tags)
        : [],
    }));
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.surname || !form.email || (!form.id && !form.password)) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }
    setError("");
    // Conversione robusta
    const tagsString = Array.isArray(form.tags)
      ? form.tags.join(",")
      : (form.tags || "");
    const payload = { ...form, tags: tagsString };
    onSave(payload);
  }

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.25)", zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff", borderRadius: 16, minWidth: 420, padding: 36,
          boxShadow: "0 2px 18px #0002", maxWidth: 510,
        }}
      >
        <h2 style={{ color: "#23285A", fontWeight: 700, marginBottom: 22 }}>
          {form.id ? "Modifica Utente" : "Nuovo Utente"}
        </h2>
        {error && <div style={{ color: "red", fontWeight: 600, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Nome *</label>
            <input value={form.name} onChange={e => setField("name", e.target.value)} required className="input" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Cognome *</label>
            <input value={form.surname} onChange={e => setField("surname", e.target.value)} required className="input" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e => setField("email", e.target.value)} required className="input" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Password {form.id ? "(lascia vuoto per non cambiare)" : "*"}</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setField("password", e.target.value)}
              minLength={form.id ? 0 : 4}
              required={!form.id}
              className="input"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Telefono</label>
            <input value={form.phone} onChange={e => setField("phone", e.target.value)} className="input" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Indirizzo</label>
            <input value={form.address} onChange={e => setField("address", e.target.value)} className="input" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Ruolo *</label>
            <input value={form.role} onChange={e => setField("role", e.target.value)} required className="input" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Stato *</label>
            <select value={form.status} onChange={e => setField("status", e.target.value)} className="input">
              <option value="attivo">Attivo</option>
              <option value="bloccato">Bloccato</option>
              <option value="archiviato">Archiviato</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Tag</label>
          <Select
            isMulti
            options={tagOptions}
            value={tagOptions.filter(opt => form.tags.includes(opt.value))}
            onChange={vals => setField("tags", vals.map(v => v.value))}
            placeholder="Seleziona uno o più tag"
            styles={{
              control: (base) => ({ ...base, minHeight: 36, borderRadius: 8 }),
              valueContainer: (base) => ({ ...base, padding: "0 6px" }),
              multiValue: (base) => ({ ...base, background: "#e6f4ff", color: "#0073b1", borderRadius: 7 }),
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Note</label>
          <textarea value={form.note} onChange={e => setField("note", e.target.value)} className="input" rows={2} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={{
            background: "#e6e9f6", color: "#333", border: "none",
            borderRadius: 8, padding: "8px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}>Annulla</button>
          <button type="submit" style={{
            background: "#0070f3", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}>
            Salva
          </button>
        </div>
      </form>
      <style>{`
        .input {
          width: 100%; padding: 7px 9px; margin-top: 2px;
          border: 1px solid #e0e6f2; border-radius: 8px;
          font-size: 15px; box-sizing: border-box;
        }
        label { font-weight: 600; font-size: 15px; }
      `}</style>
    </div>
  );
}
