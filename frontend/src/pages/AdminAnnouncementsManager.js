import React, { useEffect, useState } from 'react';
import API from '../api';

export default function AdminAnnouncementsManager(){
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = async ()=>{
    const r = await API.get('/announcements');
    setItems(r.data);
  };

  useEffect(()=>{ load(); }, []);

  const create = async (e)=>{
    e.preventDefault();
    try{
      await API.post('/announcements', { title, content });
      setTitle(''); setContent('');
      load();
    }catch(err){ alert(err?.response?.data?.message || 'Create failed'); }
  };

  const remove = async (id)=>{
    if(!confirm('Delete announcement?')) return;
    try{ await API.delete(`/announcements/${id}`); load(); }catch(err){ alert('Delete failed'); }
  };

  return (
    <div>
      <h2>Admin - Announcements</h2>
      <form onSubmit={create}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      <hr />
      {items.map(a=> (
        <div key={a.id}>
          <h3>{a.title}</h3>
          <p>{a.content}</p>
          <button onClick={()=>remove(a.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
