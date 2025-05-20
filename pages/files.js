// /pages/files.js
import { parse } from "cookie";
import { useEffect, useState, useRef } from "react";

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

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const res = await fetch("/api/files");
    if (!res.ok) {
      setMsg("Errore caricamento files");
      setLoading(false);
      return;
    }
    setFiles(await res.json());
    setLoading(false);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!fileInputRef.current.files.length) return;
    setUploading(true);
    setMsg("");
    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);
    // puoi aggiungere altri campi: formData.append('uploader_id', ...)
    const res = await fetch("/api/files", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      setMsg("File caricato!");
      fileInputRef.current.value = "";
      fetchFiles();
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Upload fallito"));
    }
    setUploading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm("Confermi eliminazione file?")) return;
    const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("File eliminato!");
      fetchFiles();
    } else {
      setMsg("Errore eliminazione file");
    }
  };

  const handleDownload = id => {
    // Download come attachment
    window.open(`/api/files/${id}`, '_blank');
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Files</h1>
      <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
        <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.xlsm,.csv,.pdf,.png,.jpg,.jpeg,.gif" />
        <button type="submit" disabled={uploading} style={{ marginLeft: 14 }}>
          {uploading ? "Caricamento..." : "Carica file"}
        </button>
      </form>
      {msg && <div style={{ marginBottom: 12, color: msg.startsWith("Errore") ? "#b60d0d" : "#267800" }}>{msg}</div>}
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ fontSize: 15, maxWidth: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Dimensione</th>
              <th>Data</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.id}</td>
                <td>{file.name}</td>
                <td>{file.mimetype}</td>
                <td>{(file.size/1024).toFixed(1)} KB</td>
                <td>{file.created_at ? new Date(file.created_at).toLocaleString() : ""}</td>
                <td>
                  <button onClick={() => handleDownload(file.id)}>Download</button>
                  <button onClick={() => handleDelete(file.id)} style={{ marginLeft: 8, color: 'red' }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
