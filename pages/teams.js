import React, { useState, useEffect } from "react";
import TeamModal from "../pages/components/TeamModal";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [modalTeam, setModalTeam] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchTeams();
    fetch("/api/users").then(res => res.json()).then(setUsers);
    fetch("/api/tags").then(res => res.json()).then(setTags);
  }, []);

  function fetchTeams() {
    fetch("/api/teams")
      .then(res => res.json())
      .then(setTeams);
  }

  function getUserById(id) {
    return users.find(u => String(u.id) === String(id));
  }

  // Generazione filtri dinamici:
  const usedStatuses = Array.from(new Set(teams.map(t => t.status).filter(Boolean)));
  const usedManagers = Array.from(new Set(teams.map(t => t.manager).filter(Boolean)));
  const usedTags = Array.from(new Set(
    teams.flatMap(t => (t.tags || "").split(",").map(x => x.trim()).filter(Boolean))
  ));

  const filteredTeams = teams
    .filter(t =>
      (!search ||
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      ) &&
      (!statusFilter || t.status === statusFilter) &&
      (!managerFilter || String(t.manager) === managerFilter) &&
      (!tagFilter || (t.tags || "").split(",").map(x => x.trim()).includes(tagFilter))
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
    setSearch(""); setStatusFilter(""); setManagerFilter(""); setTagFilter("");
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 22 }}>Team</h1>
      {/* Barra filtri */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <input
          placeholder="Cerca per nome o descrizione..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutti gli stati</option>
          {usedStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select value={managerFilter} onChange={e => setManagerFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutti i responsabili</option>
          {usedManagers.map(mId => {
            const user = getUserById(mId);
            return user
              ? <option key={user.id} value={user.id}>{user.name} {user.surname}</option>
              : null;
          })}
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutti i tag</option>
          {usedTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <button onClick={resetFilters} style={{
          background: "#e6e9f6", border: "none", borderRadius: 8, padding: "8px 16px",
          fontWeight: 600, color: "#23285A", cursor: "pointer"
        }}>Reset</button>
        <div style={{ flex: "1 0 90px", textAlign: "right" }}>
          <button
            onClick={() => setModalTeam({})}
            style={{
              background: "#0749a6",
              color: "#fff",
              padding: "10px 22px",
              fontWeight: "bold",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              cursor: "pointer"
            }}>
            + Nuovo Team
          </button>
        </div>
      </div>
      {/* Tabella */}
      <div style={{
        background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px #0002", padding: 18, maxWidth: 1350, margin: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f6f8fa" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle} onClick={() => toggleSort("name")} className="sortable">
                Nome {sortField === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle}>Descrizione</th>
              <th style={thStyle} onClick={() => toggleSort("status")} className="sortable">
                Stato {sortField === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle}>Responsabile</th>
              <th style={thStyle}>Membri</th>
              <th style={thStyle}>Tag</th>
              <th style={thStyle}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((t, i) => (
              <tr key={t.id} style={{ background: i % 2 === 0 ? "#f8fbff" : "#fff" }}>
                <td style={tdStyle}>{t.id}</td>
                <td style={tdStyle}>{t.name}</td>
                <td style={tdStyle}>{t.description}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: t.status === "attivo" ? "#d1f8c3" : t.status === "bloccato" ? "#fce4e4" : "#eee",
                    color: t.status === "attivo" ? "#278626" : t.status === "bloccato" ? "#d32f2f" : "#aaa",
                    fontWeight: 600, padding: "3px 10px", borderRadius: 8,
                  }}>
                    {t.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  {getUserById(t.manager)?.name} {getUserById(t.manager)?.surname}
                </td>
                <td style={tdStyle}>
                  {(t.members || "")
                    .split(",")
                    .map(id => {
                      const u = getUserById(id.trim());
                      return u ? (
                        <span key={u.id}
                          style={{
                            background: "#d2e3fc", color: "#204080", padding: "2px 8px", borderRadius: 6,
                            marginRight: 3, fontSize: 12, display: "inline-block"
                          }}>
                          {u.name}
                        </span>
                      ) : null;
                    })}
                </td>
                <td style={tdStyle}>
                  {(t.tags || "")
                    .split(",")
                    .map(tag => (
                      <span key={tag} style={{
                        background: "#ffe8c7", color: "#a35b00", padding: "2px 8px",
                        borderRadius: 6, marginRight: 3, fontSize: 12, display: "inline-block"
                      }}>{tag}</span>
                    ))}
                </td>
                <td style={tdStyle}>
                  <button
                    title="Modifica"
                    onClick={() => setModalTeam(t)}
                    style={{
                      background: "#f5f5f5", border: "none", borderRadius: 8, padding: "6px 14px",
                      cursor: "pointer"
                    }}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modale creazione/modifica team */}
      {modalTeam && (
        <TeamModal
          team={modalTeam}
          onClose={() => setModalTeam(null)}
          onSaved={() => {
            fetchTeams();
            setModalTeam(null);
          }}
        />
      )}
      <style>{`
        .sortable { cursor: pointer; user-select: none; }
        .sortable:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

const inputStyle = {
  minWidth: 120, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e6f2", flex: "1 1 140px"
};
const thStyle = { padding: 10, fontWeight: 600, cursor: "default" };
const tdStyle = { padding: 10 };
