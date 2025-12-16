import React, { useEffect, useState } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';

export default function UserProfile(){
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '', phone: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(()=>{
    API.get(`/users/${id}`).then(r=>{ 
      setProfile(r.data); 
      setForm({ name: r.data.name||'', bio: r.data.bio||'', avatar: r.data.avatar||'', phone: r.data.phone||'' }); 
    }).catch(()=>{});
    
    // Fetch user's concerns
    API.get('/concerns').then(r => setConcerns(r.data || [])).catch(()=>{});
  },[id]);

  const save = async ()=>{
    try{
      // If user selected a new avatar file, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const uploadResponse = await API.post(`/users/${id}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Update the form with the new avatar path from server
        setForm({...form, avatar: uploadResponse.data.avatar});
      }
      
      const r = await API.put(`/users/${id}`, form);
      setProfile(r.data);
      setEditing(false);
      setAvatarFile(null);
    }catch(err){ 
      console.error(err);
      alert('Update failed'); 
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  if(!profile) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>{profile.name}</h2>
      {profile.avatar && (
        <img 
          src={profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:4000${profile.avatar}`} 
          alt="avatar" 
          style={{width:80,height:80,objectFit:'cover',borderRadius:'50%'}} 
        />
      )}
      <p>{profile.bio}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      {editing ? (
        <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label><strong>Name:</strong></label>
            <input 
              value={form.name} 
              onChange={e=>setForm({...form,name:e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label><strong>Phone:</strong></label>
            <input 
              value={form.phone} 
              onChange={e=>setForm({...form,phone:e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label><strong>Avatar:</strong></label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ marginTop: '4px' }}
            />
            {avatarFile && <span> Selected: {avatarFile.name}</span>}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label><strong>Bio:</strong></label>
            <textarea 
              value={form.bio} 
              onChange={e=>setForm({...form,bio:e.target.value})}
              rows="4"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '4px', fontFamily: 'sans-serif' }}
            />
          </div>
          <button 
            onClick={save}
            style={{ padding: '8px 16px', background: '#c33', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
          >
            Save
          </button>
          <button 
            onClick={()=>{setEditing(false); setAvatarFile(null);}}
            style={{ padding: '8px 16px', background: '#666', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          <button 
            onClick={()=>setEditing(true)}
            style={{ padding: '8px 16px', background: '#c33', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* My Concerns Section */}
      <hr />
      <h3>My Concerns</h3>
      {concerns.length === 0 ? (
        <p style={{ color: '#666' }}>No concerns submitted yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {concerns.map(concern => (
            <div key={concern.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px', background: '#fafafa' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{concern.subject}</h4>
              <p style={{ margin: '0 0 12px 0', color: '#333', lineHeight: '1.5' }}>{concern.message}</p>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
                Submitted: {new Date(concern.created_at).toLocaleString()}
              </div>

              {concern.replies && concern.replies.length > 0 && (
                <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #2e7d32' }}>
                  <strong style={{ color: '#2e7d32' }}>Admin Replies:</strong>
                  {concern.replies.map(reply => (
                    <div key={reply.id} style={{ marginTop: '8px', fontSize: '13px' }}>
                      <div style={{ color: '#2e7d32', fontWeight: '600' }}>{reply.admin_name}</div>
                      <div style={{ color: '#333' }}>{reply.message}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(reply.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
