import React, { useEffect, useState } from 'react';
import API from '../api';

export default function AdminEventsManager(){
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');

  const load = async ()=>{
    const r = await API.get('/events');
    setItems(r.data);
  };

  useEffect(()=>{ load(); }, []);

  const create = async (e)=>{
    e.preventDefault();
    try{
      await API.post('/events', { title, description, event_date: eventDate });
      setTitle(''); setDescription(''); setEventDate('');
      load();
    }catch(err){ alert(err?.response?.data?.message || 'Create failed'); }
  };

  const remove = async (id)=>{
    if(!window.confirm('Delete event?')) return;
    try{
      await API.delete(`/events/${id}`);
      load();
    }catch(err){
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message || 'Delete failed';
      alert(`Delete failed (${status}): ${msg}`);
    }
  };

  return (
    <div>
      <h2>Admin - Events</h2>
      <form onSubmit={create}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      <hr />
      {items.map(a=> (
        <div key={a.id}>
          <h3>{a.title} — {a.event_date}</h3>
          <p>{a.description}</p>
          <button onClick={()=>remove(a.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
