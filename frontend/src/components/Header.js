import React, { useState, useContext, useRef } from 'react';
import './header.css';
import AuthContext from '../auth/AuthContext';
import API from '../api';
import './header.css';

export default function Header({ onOpenNewPost }){
  const { user, logout, login } = useContext(AuthContext);
  const [q, setQ] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const fileRef = useRef();

  const onSearch = (e) => {
    e.preventDefault();
    // simple client-side navigation; you can implement a /search route later
    window.location.href = `/announcements?q=${encodeURIComponent(q)}`;
  };

  const baseApi = (process.env.REACT_APP_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/,'');

  const avatarSrc = user && user.avatar ? (user.avatar.startsWith('http') ? user.avatar : baseApi + user.avatar) : (process.env.PUBLIC_URL + '/roundbrgy.png');

  const toggleDropdown = () => setShowDropdown(s => !s);

  const onChooseFile = () => {
    if(!fileRef.current) return;
    fileRef.current.click();
  };

  const onFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    try{
      if(!user || !user.id){
        alert('Please log in before uploading an avatar');
        return;
      }
      const fd = new FormData();
      fd.append('avatar', f);
      const endpoint = `/users/${user.id}/avatar`;
      const fullUrl = (API.defaults.baseURL || (process.env.REACT_APP_API_URL || 'http://localhost:4000/api')) + endpoint;
      console.log('Uploading avatar to:', fullUrl, 'file:', f.name, f.size, f.type);
      const res = await API.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // refresh user
      const token = localStorage.getItem('token');
      const updated = await API.get(`/users/${user.id}`);
      login(token, updated.data);
      alert('Profile image updated');
    }catch(err){
      console.error(err);
      const status = err?.response?.status;
      const respData = err?.response?.data;
      let msg = 'Upload failed';
      if (status === 404) msg = 'Upload endpoint not found (404). Is the backend running and reachable?';
      if (respData && respData.message) msg = respData.message;
      alert(msg);
    }
  };

  return (
    <header className="site-header">
      <div className="header-left">
        <img src={process.env.PUBLIC_URL + '/roundbrgy.png'} alt="logo" className="header-logo" />
        <div className="header-title">
          <div className="title-main">Barangay Fort Bonifacio</div>
          <div className="title-sub">Community Online Forum</div>
        </div>
      </div>

      <form className="header-search" onSubmit={onSearch}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search announcements, events, posts..." />
      </form>

      <div className="header-right">
        <button className="icon-btn" title="Notifications">🔔</button>
        <div className="profile-pill" onClick={toggleDropdown} style={{cursor:'pointer', position:'relative'}}>
          <img src={avatarSrc} alt="avatar" />
          <span>{user ? user.name : 'Guest'}</span>
          {showDropdown && (
            <div className="profile-dropdown">
              <button className="dropdown-item" onClick={() => { logout(); window.location.href = '/login'; }}>Logout</button>
              <button className="dropdown-item" onClick={onChooseFile}>Upload Profile Image</button>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFileChange} />
      </div>
      <div className="newpost-container">
        <button className="btn-newpost" onClick={onOpenNewPost}>+ New Post</button>
      </div>
    </header>
  );
}
