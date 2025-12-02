import React, { useEffect, useState } from 'react';
import API from '../api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get('/announcements').then(r => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Announcements</h2>
      {items.map(a => (
        <article key={a.id}>
          <h3>{a.title}</h3>
          <p>{a.content}</p>
        </article>
      ))}
    </div>
  );
}
