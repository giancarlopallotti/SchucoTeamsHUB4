// Percorso: /pages/_app.js

import '../styles/globals.css';
import { useRouter } from "next/router";
import {
  FaUsers, FaUserShield, FaProjectDiagram, FaFolderOpen,
  FaCalendarAlt, FaTags, FaSignOutAlt, FaBars, FaTasks
} from "react-icons/fa";
import { useState, useEffect } from "react";

const linkData = [
  { href: "/", label: "Dashboard", icon: <FaUserShield /> },
  { href: "/users", label: "Utenti", icon: <FaUsers /> },
  { href: "/teams", label: "Team", icon: <FaProjectDiagram /> },
  { href: "/files", label: "Files", icon: <FaFolderOpen /> },
  { href: "/clients", label: "Clienti", icon: <FaUsers /> },
  { href: "/projects", label: "Progetti", icon: <FaProjectDiagram /> },
  { href: "/activities", label: "Attività", icon: <FaTasks />, notify: true },
  { href: "/calendar", label: "Calendario", icon: <FaCalendarAlt /> },
  { href: "/tags", label: "Tag", icon: <FaTags /> },
];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activitiesNotifications, setActivitiesNotifications] = useState(0);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null); // <--- nuovo stato per info utente loggato

  // Fetch info utente loggato
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setLoggedUser(data));
  }, []);

  // Aggiorna badge ogni 60s
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/activities/notifications');
        if (res.ok) {
          const data = await res.json();
          setActivitiesNotifications(Array.isArray(data) ? data.length : (data.count || 0));
        }
      } catch {}
    };
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  // Detect screen width for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(s => !s);

  // Sidebar visibile solo se NON siamo su /login
  const hideSidebarRoutes = ["/login"];
  const showSidebar = !hideSidebarRoutes.includes(router.pathname);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Burger icon solo se sidebar nascosta su mobile */}
      {!showSidebar && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 18,
            left: 12,
            zIndex: 1001,
            background: '#162364',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: 8,
            fontSize: 28,
            boxShadow: '0 1px 8px rgba(0,0,0,0.09)',
            cursor: 'pointer',
          }}
        >
          <FaBars />
        </button>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <nav
          style={{
            width: collapsed ? 64 : 220,
            background: '#162364',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: collapsed ? 'center' : 'flex-start',
            padding: '24px 0',
            transition: 'width 0.25s',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            minHeight: '100vh',
            zIndex: 1000,
            boxShadow: '2px 0 6px rgba(0,0,0,0.10)',
          }}
        >
          <div style={{ width: "100%", textAlign: 'center', marginBottom: collapsed ? 0 : 32 }}>
            {!collapsed && (
              <>
                <img
                  src="/LogoSchuco.png"
                  alt="Schüco"
                  style={{ maxWidth: 130, marginBottom: 16, marginLeft: "auto", marginRight: "auto", display: "block" }}
                />
                <div style={{ fontWeight: 'bold', fontSize: 20 }}>SchucoTeamsHUB</div>
                {/* Pulsante Info Utente */}
                <button
                  onClick={() => setShowUserInfo(true)}
                  style={{
                    margin: "18px auto 4px auto",
                    padding: "6px 24px",
                    background: "#fff",
                    color: "#23285A",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #0002"
                  }}
                >
                  Info Utente
                </button>
              </>
            )}
          </div>

          {/* Popup info utente */}
          {showUserInfo && (
            <div style={{
              position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 9999,
              background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{
                background: "#fff", color: "#23285A", borderRadius: 18,
                boxShadow: "0 4px 20px #0002", minWidth: 310, maxWidth: 390, padding: 32,
                textAlign: "center"
              }}>
                <h3 style={{ color: "#234", marginBottom: 14 }}>Informazioni utente</h3>
                <div style={{ marginBottom: 12, fontSize: 16 }}>
                  <b>Nome:</b> {loggedUser?.name || "-"}
                </div>
                <div style={{ marginBottom: 12, fontSize: 16 }}>
                  <b>Cognome:</b> {loggedUser?.surname || "-"}
                </div>
                <div style={{ marginBottom: 14, fontSize: 16 }}>
                  <b>Ruolo:</b> <span style={{color:'#00713f', fontWeight:600}}>{loggedUser?.role || "-"}</span>
                </div>
                <button
                  onClick={() => setShowUserInfo(false)}
                  style={{ marginTop: 10, padding: "7px 28px", borderRadius: 8, border: "none", background: "#0070f3", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                  Chiudi
                </button>
              </div>
            </div>
          )}

          {/* Collapse/Expand button */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'none',
              border: 'none',
              color: '#76CE40',
              fontSize: 24,
              cursor: 'pointer',
              marginLeft: collapsed ? 0 : 8,
              marginBottom: 20,
              outline: 'none'
            }}
            title={collapsed ? "Espandi" : "Collassa"}
          >
            {collapsed ? "»" : "«"}
          </button>
          <div style={{ width: "100%" }}>
            {linkData.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  ...linkStyle,
                  background: router.pathname === link.href ? "#2843A1" : "transparent",
                  borderLeft: router.pathname === link.href ? "4px solid #76CE40" : "4px solid transparent",
                  fontWeight: router.pathname === link.href ? "bold" : "normal",
                  display: 'flex',
                  alignItems: 'center',
                  padding: collapsed ? "14px 10px" : "14px 32px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 16,
                  fontSize: 16,
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
                title={link.label}
                onClick={() => {
                  if (window.innerWidth < 700) setCollapsed(false);
                }}
              >
                {link.icon}
                {!collapsed && link.label}
                {link.notify && activitiesNotifications > 0 && (
                  <span style={{
                    background: "#f43",
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: 11,
                    minWidth: 22,
                    height: 22,
                    padding: "0 6px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    position: "absolute",
                    right: collapsed ? 10 : 26,
                    top: 10,
                    boxShadow: "0 1px 4px #9008"
                  }}>
                    {activitiesNotifications}
                  </span>
                )}
              </a>
            ))}
          </div>
          {/* LOGOUT BUTTON */}
          <button
            onClick={async () => {
              await fetch("/api/logout");
              window.location.href = "/login";
            }}
            style={{
              ...linkStyle,
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? "14px 10px" : "14px 32px",
              gap: 16,
              color: "#76CE40",
              fontWeight: 'bold',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FaSignOutAlt />
            {!collapsed && "Esci"}
          </button>
        </nav>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        background: '#f3f6fb',
        minHeight: '100vh',
        marginLeft: showSidebar ? (collapsed ? 64 : 220) : 0,
        transition: 'margin-left 0.25s',
        width: "100%"
      }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  borderLeft: '4px solid transparent',
  margin: '4px 0',
  borderRadius: '0 8px 8px 0',
  transition: 'all 0.15s',
  fontWeight: 400,
};
