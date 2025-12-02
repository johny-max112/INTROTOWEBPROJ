import React, { useEffect, useState } from 'react';
import API from '../api';

export default function EventsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get('/events').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Community Events</h2>
      {items.map(e => (
        <article key={e.id}>
          <h3>{e.title} — {e.event_date}</h3>
          <p>{e.description}</p>
        </article>
      ))}
    </div>
  );
}
