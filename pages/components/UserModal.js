// Percorso: /pages/components/UserModal.js
import { useState, useEffect } from "react";

const emptyUser = {
  id: "",
  name: "",
  surname: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  note: "",
  role: "",
  status: "",
  tags: "",
};

export default function UserModal({ user = {}, onClose, onSaved }) {
  const [form, setForm] = useState({ ...emptyUser, ...user });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetch("/api/roles")
      .then(res => res.json())
      .then(setRoles)
      .catch(() => setRoles([]));
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  function validate() {
    let errs = {};
    if (!form.name.trim()) errs.name = "Il nome è obbligatorio";
    if (!form.surname.trim()) errs.surname = "Il cognome è obbligatorio";
    if (!form.email.trim()) errs.email = "L'email è obbligatoria";
    if (!form.role.trim()) errs.role = "Il ruolo è obbligatorio";
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(errs => ({ ...errs, [name]: undefined })); // cancella errore su edit
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `/api/users/${form.id}` : "/api/users";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Errore nel salvataggio utente!");
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.28)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px #0003",
          padding: 32,
          minWidth: 340,
          maxWidth: 480,
          width: "96vw",
        }}
        noValidate
      >
        <h2 style={{
          fontSize: 25,
          fontWeight: 700,
          color: "#23285A",
          marginBottom: 24,
          textAlign: "center"
        }}>
          {form.id ? "Modifica Utente" : "Nuovo Utente"}
        </h2>
        <div className="modal-fields" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 24
        }}>
          {/* Sinistra */}
          <div style={{ flex: "1 1 180px", minWidth: 0 }}>
            <LabelInput
              label="Nome"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <LabelInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              // Email ora sempre modificabile!
            />
            <LabelInput
              label="Telefono"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            {/* RUOLO: select da DB */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>
                Ruolo <span style={{ color: "#d32f2f" }}>*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                style={{
                  ...inputStyle,
                  borderColor: errors.role ? "#d32f2f" : "#e0e6f2",
                  background: errors.role ? "#fff4f5" : "#f9fafc"
                }}
              >
                <option value="">-- Seleziona ruolo --</option>
                {roles.map(r => (
                  <option value={r.name} key={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.role && (
                <div style={{ color: "#d32f2f", fontSize: 12, marginTop: 2 }}>{errors.role}</div>
              )}
            </div>
            <LabelInput
              label="Tag"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="TEAM1,MANUTENZIONE"
            />
          </div>
          {/* Destra */}
          <div style={{ flex: "1 1 180px", minWidth: 0 }}>
            <LabelInput
              label="Cognome"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              error={errors.surname}
              required
            />
            <LabelInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!form.id}
              placeholder={form.id ? "Lascia vuoto per non cambiare" : ""}
            />
            <LabelInput
              label="Indirizzo"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Stato</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">-- Seleziona --</option>
                <option value="attivo">Attivo</option>
                <option value="bloccato">Bloccato</option>
                <option value="archiviato">Archiviato</option>
              </select>
            </div>
          </div>
          {/* Note su due colonne */}
          <div style={{ width: "100%" }}>
            <label style={labelStyle}>Note</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, marginTop: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 26px",
              background: "#f4f6fa",
              color: "#23285A",
              border: "none",
              borderRadius: 9,
              fontWeight: "bold",
              fontSize: 16
            }}>
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 32px",
              background: "#0b3f86",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontWeight: "bold",
              fontSize: 16,
              boxShadow: "0 2px 6px #0b3f8620"
            }}>
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
        <style>{`
          @media (max-width: 700px) {
            .modal-fields {
              flex-direction: column;
            }
          }
          input:disabled {
            background: #f6f6f6;
          }
        `}</style>
      </form>
    </div>
  );
}

function LabelInput({ label, error, required, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}
      </label>
      <input
        {...props}
        style={{
          ...inputStyle,
          borderColor: error ? "#d32f2f" : "#e0e6f2",
          background: error ? "#fff4f5" : "#f9fafc"
        }}
      />
      {error && (
        <div style={{ color: "#d32f2f", fontSize: 12, marginTop: 2 }}>{error}</div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: 600,
  color: "#23285A",
  marginBottom: 4,
  letterSpacing: 0.1
};
const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e0e6f2",
  borderRadius: 7,
  fontSize: 15,
  background: "#f9fafc",
  outline: "none"
};
