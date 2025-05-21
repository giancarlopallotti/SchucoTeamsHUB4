// /pages/users.js

import { useEffect, useState } from "react";
import UserModal from "./components/UserModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tags, setTags] = useState([]);
  const [modalUser, setModalUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  // Filtri
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetch("/api/users").then(res => res.json()).then(setUsers);
    fetch("/api/roles").then(res => res.json()).then(setRoles);
    fetch("/api/teams").then(res => res.json()).then(setTeams);
    fetch("/api/tags").then(res => res.json()).then(setTags);
  }, []);

  // Filtra e ordina
  const filteredUsers = users
    .filter(u =>
      (!search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.surname?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      ) &&
      (!roleFilter ||
        (u.roles_teams && u.roles_teams.length
          ? u.roles_teams.some(rt =>
              rt.role === roleFilter ||
              rt.role_id === roleFilter ||
              (typeof rt.role === "object" && rt.role?.name === roleFilter)
            )
          : u.role === roleFilter)
      ) &&
      (!statusFilter || u.status === statusFilter) &&
      (!tagFilter || (u.tags && u.tags.toLowerCase().includes(tagFilter.toLowerCase())))
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      let va = a[sortField] || "";
      let vb = b[sortField] || "";
      return va.localeCompare(vb) * dir;
    });

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function resetFilters() {
    setSearch(""); setRoleFilter(""); setStatusFilter(""); setTagFilter("");
  }

  // Modal dettagli utente (read-only)
  function UserDetailModal({ user, onClose }) {
    if (!user) return null;
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.32)", zIndex: 1100,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 36,
          minWidth: 370, maxWidth: 520, boxShadow: "0 2px 18px #0002"
        }}>
          <h2 style={{ color: "#23285A", marginBottom: 20 }}>Dettaglio Utente</h2>
          <table style={{ width: "100%", fontSize: 15, marginBottom: 24 }}>
            <tbody>
              {Object.entries(user).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 600, padding: "7px 14px 7px 0", color: "#234" }}>{key}</td>
                  <td style={{ padding: "7px 0" }}>{String(val ?? "").length ? String(val) : <span style={{color:'#ccc'}}>-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={onClose} style={{ padding: "9px 28px", borderRadius: 8, border: "none", background: "#0070f3", color: "#fff", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Chiudi</button>
        </div>
      </div>
    );
  }

  // Salva utente
  async function handleSaveUser(userData) {
    const method = userData.id ? "PUT" : "POST";
    const url = userData.id ? `/api/users/${userData.id}` : "/api/users";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    if (res.ok) {
      fetch("/api/users").then(res => res.json()).then(setUsers);
      setModalUser(null);
    } else {
      alert("Errore salvataggio utente!");
    }
  }

  // --- PATCH CRUCIALE: Normalizzazione dei dati per la modale ---
  function handleEditUser(u) {
    let roles_teams = [];
    // Normalizza: accetta vecchio formato (role/team stringa), nuovo formato (id), formato oggetto
    if (Array.isArray(u.roles_teams) && u.roles_teams.length) {
      roles_teams = u.roles_teams.map(rt => {
        // Caso già corretto: {role_id, team_id}
        if (typeof rt.role_id !== "undefined" && typeof rt.team_id !== "undefined") {
          return { role_id: rt.role_id, team_id: rt.team_id };
        }
        // Caso: {role: "Nome", team: "Nome"}
        if (typeof rt.role === "string" && typeof rt.team === "string") {
          return {
            role_id: roles.find(r => r.name === rt.role)?.id,
            team_id: teams.find(t => t.name === rt.team)?.id
          };
        }
        // Caso: {role: {id, name}, team: {id, name}}
        if (typeof rt.role === "object" && typeof rt.team === "object") {
          return {
            role_id: rt.role.id,
            team_id: rt.team.id
          };
        }
        return null;
      }).filter(Boolean);
    }
    setModalUser({ ...u, roles_teams });
  }

  return (
    <div className="users-page" style={{ padding: "2rem" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 24 }}>Utenti</h1>
      {/* Barra filtri */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10,
        marginBottom: 22, alignItems: "center"
      }}>
        <input
          placeholder="Cerca per nome, cognome, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: "2 1 200px", minWidth: 120, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e6f2" }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ flex: "1 1 120px", minWidth: 90, borderRadius: 8, border: "1px solid #e0e6f2", padding: "7px 10px" }}
        >
          <option value="">Tutti i ruoli</option>
          {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ flex: "1 1 100px", minWidth: 90, borderRadius: 8, border: "1px solid #e0e6f2", padding: "7px 10px" }}
        >
          <option value="">Tutti gli stati</option>
          <option value="attivo">Attivo</option>
          <option value="bloccato">Bloccato</option>
          <option value="archiviato">Archiviato</option>
        </select>
        <input
          placeholder="Filtra per tag"
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          style={{ flex: "1 1 120px", minWidth: 90, borderRadius: 8, border: "1px solid #e0e6f2", padding: "7px 10px" }}
        />
        <button onClick={resetFilters} style={{
          background: "#e6e9f6", border: "none", borderRadius: 8, padding: "8px 16px",
          fontWeight: 600, color: "#23285A", cursor: "pointer"
        }}>
          Reset
        </button>
        <div style={{ flex: "1 0 90px", textAlign: "right" }}>
          <button
            onClick={() => setModalUser({})}
            style={{
              background: "#0070f3", color: "#fff", padding: "10px 22px",
              fontWeight: "bold", border: "none", borderRadius: 12, fontSize: 16, cursor: "pointer"
            }}>
            + Nuovo Utente
          </button>
        </div>
      </div>

      {/* Tabella */}
      <div style={{
        background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px #0002",
        padding: 24, maxWidth: 1250, margin: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f6f8fa" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle} onClick={() => toggleSort("name")} className="sortable">
                Nome {sortField === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle} onClick={() => toggleSort("surname")} className="sortable">
                Cognome {sortField === "surname" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle} onClick={() => toggleSort("email")} className="sortable">
                Email {sortField === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle}>Telefono</th>
              <th style={thStyle}>Ruolo</th>
              <th style={thStyle}>Stato</th>
              <th style={thStyle}>Tag</th>
              <th style={thStyle}>Note</th>
              <th style={thStyle}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? "#f8fbff" : "#fff" }}>
                <td style={tdStyle}>{u.id}</td>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.surname}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.phone}</td>
                {/* --- RUOLI MULTIPLI --- */}
                <td style={tdStyle}>
                  {u.roles_teams && u.roles_teams.length > 0
                    ? u.roles_teams.map((rt, idx) => {
                        let roleName = typeof rt.role === "string"
                          ? rt.role
                          : (typeof rt.role === "object"
                            ? rt.role?.name
                            : roles.find(r => r.id === rt.role_id)?.name
                          );
                        let teamName = typeof rt.team === "string"
                          ? rt.team
                          : (typeof rt.team === "object"
                            ? rt.team?.name
                            : teams.find(t => t.id === rt.team_id)?.name
                          );
                        return (
                          <span key={idx} style={{
                            background: "#e3fcec", color: "#21704e", fontWeight: 600,
                            padding: "3px 10px", borderRadius: 8, marginRight: 4, display: "inline-block"
                          }}>
                            {roleName || ""} - {teamName || ""}
                          </span>
                        );
                      })
                    : (
                        <span style={{
                          background: "#e3fcec", color: "#21704e", fontWeight: 600,
                          padding: "3px 10px", borderRadius: 8,
                        }}>
                          {u.role || "Nessuno"}
                        </span>
                      )
                  }
                </td>
                <td style={tdStyle}>
                  <span style={{
                    background: u.status === "attivo" ? "#d1f8c3" : "#fce4e4",
                    color: u.status === "attivo" ? "#278626" : "#d32f2f",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 8,
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  {(u.tags && u.tags.length > 0)
                    ? u.tags.split(",").map(tag => (
                        <span key={tag} style={{
                          background: "#e6f4ff", color: "#0073b1",
                          padding: "2px 9px", borderRadius: 8, marginRight: 4, fontSize: 13, fontWeight: 600,
                        }}>{tag}</span>
                      ))
                    : <span style={{color:"#b9b9b9"}}>-</span>
                  }
                </td>
                <td style={{ ...tdStyle, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {u.note && u.note.length > 0
                    ? <span title={u.note}>{u.note.length > 40 ? u.note.substring(0, 40) + "…" : u.note}</span>
                    : <span style={{ color: '#ccc' }}>-</span>}
                </td>
                <td style={tdStyle}>
                  <button
                    title="Visualizza dettagli"
                    style={{
                      background: "#f0f5ff",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 14px",
                      marginRight: 4,
                      cursor: "pointer",
                      fontSize: 17
                    }}
                    onClick={() => setViewUser(u)}
                  >
                    👁️
                  </button>
                  <button
                    title="Modifica"
                    style={{
                      background: "#f5f5f5",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 14px",
                      marginRight: 8,
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                    onClick={() => handleEditUser(u)}
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
      </div>
      {modalUser && (
        <UserModal
          open={!!modalUser}
          user={modalUser}
          onClose={() => setModalUser(null)}
          onSave={handleSaveUser}
          roles={roles}
          teams={teams}
          tags={tags}
        />
      )}
      <style>{`
        .sortable { cursor: pointer; user-select: none; }
        .sortable:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

const thStyle = { padding: 10, fontWeight: 600, cursor: "default" };
const tdStyle = { padding: 10 };
