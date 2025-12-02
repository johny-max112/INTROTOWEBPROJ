import React, { useState } from 'react';
import API from '../api';
import '../styles/login.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', { name, email, phone, password });
      setMsg('Registered. You can now log in.');
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${(process.env.PUBLIC_URL || '') + '/Login.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="login-card">
        <h2>Register (Residents only)</h2>
        <form onSubmit={submit}>
          <div className="login-field">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

        </form>
        <div className="login-msg">{msg}</div>
      </div>
      <div className="auth-bottom-actions">
        <button className="btn-secondary" onClick={() => window.location.href = '/login'}>Log in</button>
        <button className="btn-light-red" onClick={submit}>Sign up</button>
      </div>
    </div>
  );
}
