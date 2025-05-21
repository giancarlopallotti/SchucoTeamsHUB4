// /pages/components/UserModal.js
// v2 - 21/05/2025

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import TagSelect from "./TagSelect";

export default function UserModal({
  open,
  onClose,
  onSave,
  user,
  teams,
  roles,
  tags,
  loading,
}) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    status: "attivo",
    tags: [],
    roles_teams: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        ...user,
        tags: user.tags ? (Array.isArray(user.tags) ? user.tags : user.tags.split(",")) : [],
        roles_teams: user.roles_teams || [],
      });
    } else {
      setForm({
        name: "",
        surname: "",
        email: "",
        password: "",
        phone: "",
        status: "attivo",
        tags: [],
        roles_teams: [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTagsChange = (selected) => {
    setForm((f) => ({
      ...f,
      tags: selected,
    }));
  };

  // Gestione matrix avanzata
  const handleMatrixChange = (team_id, role_id) => {
    setForm((f) => {
      const exists = f.roles_teams.some(
        (rt) => rt.team_id === team_id && rt.role_id === role_id
      );
      let updated;
      if (exists) {
        updated = f.roles_teams.filter(
          (rt) => !(rt.team_id === team_id && rt.role_id === role_id)
        );
      } else {
        updated = [...f.roles_teams, { team_id, role_id }];
      }
      return { ...f, roles_teams: updated };
    });
  };

  const isChecked = (team_id, role_id) => {
    return form.roles_teams.some(
      (rt) => rt.team_id === team_id && rt.role_id === role_id
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      tags: Array.isArray(form.tags) ? form.tags.join(",") : form.tags,
      roles_teams: form.roles_teams,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={user && user.id ? "Modifica Utente" : "Nuovo Utente"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <input
            className="input flex-1"
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="input flex-1"
            name="surname"
            placeholder="Cognome"
            value={form.surname}
            onChange={handleChange}
            required
          />
        </div>
        <input
          className="input w-full"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
        />
        <input
          className="input w-full"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          type="password"
          autoComplete="new-password"
          required={!user}
        />
        <input
          className="input w-full"
          name="phone"
          placeholder="Telefono"
          value={form.phone}
          onChange={handleChange}
        />
        <div>
          <label className="block font-semibold mb-1">Stato</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="attivo">Attivo</option>
            <option value="bloccato">Bloccato</option>
          </select>
        </div>
        <TagSelect tags={tags} value={form.tags} onChange={handleTagsChange} />

        {/* --- MATRIX RUOLI / TEAM AVANZATA --- */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">Permessi utente (Team × Ruolo):</label>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded bg-white shadow-sm">
              <thead>
                <tr>
                  <th className="py-2 px-3 border-b bg-gray-50 text-left">Team</th>
                  {roles.map((role) => (
                    <th key={role.id} className="py-2 px-3 border-b bg-gray-50 text-center">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border-b font-semibold">{team.name}</td>
                    {roles.map((role) => (
                      <td
                        key={role.id}
                        className="py-2 px-3 border-b text-center"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked(team.id, role.id)}
                          onChange={() => handleMatrixChange(team.id, role.id)}
                          className="accent-blue-600 w-5 h-5"
                          aria-label={`Abilita ${role.name} in ${team.name}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* --- /FINE MATRIX AVANZATA --- */}

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annulla
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
