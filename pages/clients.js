// pages/clients.js
import { parse } from "cookie";
import { useEffect, useState } from "react";

// --- Protezione pagina lato server ---
export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default function ClientsPage() {
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    surname: "",
    name: "",
    company: "",
    address: "",
    city: "",
    cap: "",
    province: "",
    note: "",
    main_contact: "",
    phone: "",
    mobile: "",
    emails: "",
    documents: ""
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const res = await fetch("/api/clients");
    if (!res.ok) {
      setMsg("Errore caricamento clienti");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setClienti(data);
    setLoading(false);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    if (!form.surname || !form.name) {
      setMsg("Cognome e nome sono obbligatori!");
      return;
    }
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg("Cliente aggiunto!");
      setForm({
        surname: "",
        name: "",
        company: "",
        address: "",
        city: "",
        cap: "",
        province: "",
        note: "",
        main_contact: "",
        phone: "",
        mobile: "",
        emails: "",
        documents: ""
      });
      fetchClients();
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile aggiungere cliente"));
    }
  };

  // --- MODIFICA CLIENTE ---
  const startEdit = (cliente) => {
    setEditId(cliente.id);
    setEditForm({ ...cliente });
  };
  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleEditSubmit = async (id) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      setMsg("Cliente aggiornato!");
      setEditId(null);
      fetchClients();
    } else {
      setMsg("Errore aggiornamento cliente");
    }
  };
  // --- CANCELLA CLIENTE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo cliente?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("Cliente eliminato!");
      fetchClients();
    } else {
      setMsg("Errore eliminazione cliente");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Clienti</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input name="surname" placeholder="Cognome *" value={form.surname} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="name" placeholder="Nome *" value={form.name} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="company" placeholder="Società" value={form.company} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="address" placeholder="Indirizzo" value={form.address} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="city" placeholder="Città" value={form.city} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="cap" placeholder="CAP" value={form.cap} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="province" placeholder="Provincia" value={form.province} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="main_contact" placeholder="Referente" value={form.main_contact} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="phone" placeholder="Telefono" value={form.phone} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="mobile" placeholder="Cellulare" value={form.mobile} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="emails" placeholder="Email (separate da , )" value={form.emails} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="documents" placeholder="Documenti allegati" value={form.documents} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="note" placeholder="Note" value={form.note} onChange={handleChange} style={{ marginRight: 10 }} />
        <button type="submit">Aggiungi Cliente</button>
      </form>
      {msg && <p><b>{msg}</b></p>}
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ maxWidth: "100%", fontSize: 14 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cognome</th>
              <th>Nome</th>
              <th>Società</th>
              <th>Indirizzo</th>
              <th>Città</th>
              <th>CAP</th>
              <th>Provincia</th>
              <th>Referente</th>
              <th>Telefono</th>
              <th>Cellulare</th>
              <th>Email</th>
              <th>Note</th>
              <th>Documenti</th>
              <th>Data</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clienti.map(c => (
              editId === c.id ? (
                <tr key={c.id} style={{ background: "#eef" }}>
                  <td>{c.id}</td>
                  <td><input name="surname" value={editForm.surname || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="name" value={editForm.name || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="company" value={editForm.company || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="address" value={editForm.address || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="city" value={editForm.city || ""} onChange={handleEditChange} style={{ width: 60 }} /></td>
                  <td><input name="cap" value={editForm.cap || ""} onChange={handleEditChange} style={{ width: 40 }} /></td>
                  <td><input name="province" value={editForm.province || ""} onChange={handleEditChange} style={{ width: 50 }} /></td>
                  <td><input name="main_contact" value={editForm.main_contact || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="phone" value={editForm.phone || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="mobile" value={editForm.mobile || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td><input name="emails" value={editForm.emails || ""} onChange={handleEditChange} style={{ width: 110 }} /></td>
                  <td><input name="note" value={editForm.note || ""} onChange={handleEditChange} style={{ width: 70 }} /></td>
                  <td><input name="documents" value={editForm.documents || ""} onChange={handleEditChange} style={{ width: 80 }} /></td>
                  <td>{c.created_at}</td>
                  <td>
                    <button onClick={() => handleEditSubmit(c.id)}>Salva</button>
                    <button onClick={() => setEditId(null)} style={{ marginLeft: 6 }}>Annulla</button>
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.surname}</td>
                  <td>{c.name}</td>
                  <td>{c.company}</td>
                  <td>{c.address}</td>
                  <td>{c.city}</td>
                  <td>{c.cap}</td>
                  <td>{c.province}</td>
                  <td>{c.main_contact}</td>
                  <td>{c.phone}</td>
                  <td>{c.mobile}</td>
                  <td>{c.emails}</td>
                  <td>{c.note}</td>
                  <td>{c.documents}</td>
                  <td>{c.created_at}</td>
                  <td>
                    <button onClick={() => startEdit(c)}>Modifica</button>
                    <button onClick={() => handleDelete(c.id)} style={{ marginLeft: 6, color: 'red' }}>Elimina</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
