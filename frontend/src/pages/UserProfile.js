import React, { useEffect, useState } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';

export default function UserProfile(){
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '', phone: '' });

  useEffect(()=>{
    API.get(`/users/${id}`).then(r=>{ setProfile(r.data); setForm({ name: r.data.name||'', bio: r.data.bio||'', avatar: r.data.avatar||'', phone: r.data.phone||'' }); }).catch(()=>{});
  },[id]);

  const save = async ()=>{
    try{
      const r = await API.put(`/users/${id}`, form);
      setProfile(r.data);
      setEditing(false);
    }catch(err){ alert('Update failed'); }
  };

  if(!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>{profile.name}</h2>
      <img src={profile.avatar} alt="avatar" style={{width:80,height:80}} />
      <p>{profile.bio}</p>
      <p>Role: {profile.role}</p>
      {editing ? (
        <div>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <input value={form.avatar} onChange={e=>setForm({...form,avatar:e.target.value})} />
          <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />
          <button onClick={save}>Save</button>
          <button onClick={()=>setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <button onClick={()=>setEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}
