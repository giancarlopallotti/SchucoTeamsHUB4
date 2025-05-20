// pages/calendar.js
import { parse } from "cookie";

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

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { format, parseISO } from "date-fns";
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Funzione per adattare i dati eventi al formato richiesto
function mapEvent(ev) {
  return {
    id: ev.id,
    title: ev.title,
    start: ev.start ? parseISO(ev.start) : new Date(),
    end: ev.end ? parseISO(ev.end) : (ev.start ? parseISO(ev.start) : new Date()),
    allDay: false
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setEvents(data.map(mapEvent)));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Calendario Eventi</h1>
      <Calendar
        localizer={momentLocalizer(require('moment'))}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #c8d0ee22" }}
        popup
        views={["month", "week", "day", "agenda"]}
        messages={{
          next: "Avanti", previous: "Indietro", today: "Oggi", month: "Mese", week: "Settimana", day: "Giorno", agenda: "Agenda"
        }}
        eventPropGetter={() => ({
          style: { background: "#2843A1", color: "#fff", borderRadius: 8 }
        })}
      />
    </div>
  );
}
