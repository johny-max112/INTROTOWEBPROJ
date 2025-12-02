import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import AuthContext from '../auth/AuthContext';

export default function AdminDashboard(){
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [aTitle, setATitle] = useState('');
  const [aContent, setAContent] = useState('');
  const [eTitle, setETitle] = useState('');
  const [eDescription, setEDescription] = useState('');
  const [eDate, setEDate] = useState('');
  const [dTitle, setDTitle] = useState('');
  const [dContent, setDContent] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [concerns, setConcerns] = useState([]);

  const { user } = useContext(AuthContext);

  useEffect(()=>{
    API.get('/announcements').then(r=>setAnnouncements(r.data)).catch(()=>{});
    API.get('/events').then(r=>setEvents(r.data)).catch(()=>{});
    API.get('/suggestions').then(r=>setSuggestions(r.data)).catch(()=>{});
    API.get('/discussions').then(r=>setDiscussions(r.data)).catch(()=>{});
    API.get('/concerns').then(r=>setConcerns(r.data)).catch(()=>{});
  },[]);

  const reloadAll = ()=>{
    API.get('/announcements').then(r=>setAnnouncements(r.data)).catch(()=>{});
    API.get('/events').then(r=>setEvents(r.data)).catch(()=>{});
    API.get('/discussions').then(r=>setDiscussions(r.data)).catch(()=>{});
    API.get('/concerns').then(r=>setConcerns(r.data)).catch(()=>{});
  };

  const createAnnouncement = async (e)=>{
    e.preventDefault();
    try{
      await API.post('/announcements', { title: aTitle, content: aContent });
      setATitle(''); setAContent('');
      reloadAll();
    }catch(err){ alert(err?.response?.data?.message || 'Create announcement failed'); }
  };

  const deleteAnnouncement = async (id)=>{
    if(!window.confirm('Delete announcement?')) return;
    try{ await API.delete(`/announcements/${id}`); reloadAll(); }catch(err){ alert(err?.response?.data?.message || 'Delete failed'); }
  };

  const createEvent = async (e)=>{
    e.preventDefault();
    try{
      await API.post('/events', { title: eTitle, description: eDescription, event_date: eDate });
      setETitle(''); setEDescription(''); setEDate('');
      reloadAll();
    }catch(err){ alert(err?.response?.data?.message || 'Create event failed'); }
  };

  const deleteEvent = async (id)=>{
    if(!window.confirm('Delete event?')) return;
    try{ await API.delete(`/events/${id}`); reloadAll(); }catch(err){ alert(err?.response?.data?.message || 'Delete failed'); }
  };

  const createDiscussion = async (e)=>{
    e.preventDefault();
    try{
      await API.post('/discussions', { title: dTitle, content: dContent });
      setDTitle(''); setDContent('');
      reloadAll();
    }catch(err){ alert(err?.response?.data?.message || 'Create discussion failed'); }
  };

  const deleteDiscussion = async (id)=>{
    if(!window.confirm('Delete discussion?')) return;
    try{ await API.delete(`/discussions/${id}`); reloadAll(); }catch(err){ alert(err?.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Announcements</h3>
        {user && user.role === 'admin' && (
          <form onSubmit={createAnnouncement} style={{marginBottom:12}}>
            <input placeholder="Title" value={aTitle} onChange={e=>setATitle(e.target.value)} />
            <textarea placeholder="Content" value={aContent} onChange={e=>setAContent(e.target.value)} />
            <button type="submit">Create Announcement</button>
          </form>
        )}
        {announcements.map(a=> (
          <div key={a.id} style={{border:'1px solid #ddd',padding:8,margin:6}}>
            <strong>{a.title}</strong>
            <div>{a.content}</div>
            {user && user.role === 'admin' && <button onClick={()=>deleteAnnouncement(a.id)}>Delete</button>}
          </div>
        ))}
      </section>
      <section>
        <h3>Events</h3>
        {user && user.role === 'admin' && (
          <form onSubmit={createEvent} style={{marginBottom:12}}>
            <input placeholder="Title" value={eTitle} onChange={e=>setETitle(e.target.value)} />
            <input type="date" value={eDate} onChange={e=>setEDate(e.target.value)} />
            <textarea placeholder="Description" value={eDescription} onChange={e=>setEDescription(e.target.value)} />
            <button type="submit">Create Event</button>
          </form>
        )}
        {events.map(ev=> (
          <div key={ev.id} style={{border:'1px solid #ddd',padding:8,margin:6}}>
            <strong>{ev.title} — {ev.event_date}</strong>
            <div>{ev.description}</div>
            {user && user.role === 'admin' && <button onClick={()=>deleteEvent(ev.id)}>Delete</button>}
          </div>
        ))}
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
        {user && user.role === 'admin' && (
          <form onSubmit={createDiscussion} style={{marginBottom:12}}>
            <input placeholder="Title" value={dTitle} onChange={e=>setDTitle(e.target.value)} />
            <textarea placeholder="Content" value={dContent} onChange={e=>setDContent(e.target.value)} />
            <button type="submit">Create Discussion</button>
          </form>
        )}
        {discussions.map(d => (
          <div key={d.id} style={{border:'1px solid #ddd',padding:8,margin:6}}>
            <strong>{d.title}</strong>
            <div>{d.content}</div>
            <small>By: {d.author}</small>
            {user && user.role === 'admin' && <div><button onClick={()=>deleteDiscussion(d.id)}>Delete</button></div>}
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

      {user && user.role === 'admin' && (
        <section>
          <h3>Admin Debug</h3>
          <div style={{border:'1px dashed #ccc',padding:8,margin:6}}>
            <div><strong>Logged user:</strong> {JSON.stringify(user)}</div>
            <div style={{marginTop:8}}><strong>Stored token:</strong> {localStorage.getItem('token') ? 'present' : 'missing'}</div>
            <div style={{marginTop:8}}><strong>API Authorization header:</strong> {API.defaults.headers.common?.Authorization || 'none'}</div>
          </div>
        </section>
      )}
    </div>
  );
}
