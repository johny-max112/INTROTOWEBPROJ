import React, { useEffect, useState } from 'react';
import API from '../api';

export default function AdminDashboard(){
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [concerns, setConcerns] = useState([]);

  useEffect(()=>{
    API.get('/announcements').then(r=>setAnnouncements(r.data)).catch(()=>{});
    API.get('/events').then(r=>setEvents(r.data)).catch(()=>{});
    API.get('/suggestions').then(r=>setSuggestions(r.data)).catch(()=>{});
    API.get('/discussions').then(r=>setDiscussions(r.data)).catch(()=>{});
    API.get('/concerns').then(r=>setConcerns(r.data)).catch(()=>{});
  },[]);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Announcements</h3>
        {announcements.map(a=> <div key={a.id}><strong>{a.title}</strong></div>)}
      </section>
      <section>
        <h3>Events</h3>
        {events.map(e=> <div key={e.id}><strong>{e.title}</strong></div>)}
      </section>
      <section>
        <h3>Suggestions (Resident Posts)</h3>
        {suggestions.map(s => (
          <div key={s.id} style={{border:'1px solid #ddd',padding:8,margin:6}}>
            <strong>{s.title}</strong>
            <div>{s.content}</div>
            <small>By: {s.author}</small>
          </div>
        ))}
      </section>
      <section>
        <h3>Discussions (Resident Posts)</h3>
        {discussions.map(d => (
          <div key={d.id} style={{border:'1px solid #ddd',padding:8,margin:6}}>
            <strong>{d.title}</strong>
            <div>{d.content}</div>
            <small>By: {d.author}</small>
          </div>
        ))}
      </section>
      <section>
        <h3>Concerns (Private complaints)</h3>
        {concerns.map(c => (
          <div key={c.id} style={{border:'1px solid #fdd',padding:8,margin:6}}>
            <strong>{c.subject}</strong>
            <div>{c.message}</div>
            <small>From: {c.author}</small>
          </div>
        ))}
      </section>
    </div>
  );
}
