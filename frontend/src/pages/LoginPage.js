import React, { useState, useContext } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import '../styles/login.css';

export default function LoginPage(){
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { identifier, password });
      const token = res.data.token;
      const user = res.data.user || null;
      login(token, user);
      // If admin, go straight to admin dashboard
      if (user && user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Login failed');
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
        <h2>Login</h2>
        <form onSubmit={submit}>
          <div className="login-field">
            <label>Email or Phone</label>
            <input value={identifier} onChange={e=>setIdentifier(e.target.value)} />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

        </form>
        <div className="login-msg">{msg}</div>
      </div>
      <div className="auth-bottom-actions">
        <button className="btn-secondary" onClick={() => navigate('/register')}>Sign up</button>
        <button className="btn-light-red" onClick={submit}>Log in</button>
      </div>
    </div>
  );
}
