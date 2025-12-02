import React, { useEffect, useState } from 'react';
import API from '../api';

export default function AdminDiscussionsManager(){
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = async ()=>{
    try{
      const r = await API.get('/discussions');
      setItems(r.data);
    }catch(err){
      console.error('Failed loading discussions', err);
    }
  };

  useEffect(()=>{ load(); }, []);

  const create = async (e)=>{
    e.preventDefault();
    try{
      await API.post('/discussions', { title, content });
      setTitle(''); setContent('');
      load();
    }catch(err){ alert(err?.response?.data?.message || 'Create failed'); }
  };

  return (
    <div>
      <h2>Admin - Discussions</h2>
      <form onSubmit={create}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      <hr />
      {items.map(d=> (
        <div key={d.id} style={{border:'1px solid #ddd',padding:8,margin:6}}>
          <h3>{d.title}</h3>
          <div>{d.content}</div>
          <small>By: {d.author}</small>
        </div>
      ))}
    </div>
  );
}
