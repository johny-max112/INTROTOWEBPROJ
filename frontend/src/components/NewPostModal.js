import React, { useState, useContext } from 'react';
import './newpost.css';
import API from '../api';
import AuthContext from '../auth/AuthContext';

export default function NewPostModal({ open, onClose }){
  const { user } = useContext(AuthContext);
  const [category, setCategory] = useState('Suggestion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if(!open) return null;

  const onPost = async () => {
    if(!user){
      alert('Please log in to post');
      return;
    }
    if(!title || !content) return alert('Please add title and content');
    setLoading(true);
    try{
      let url = '/suggestions';
      if(category === 'Concern') url = '/concerns';
      if(category === 'Discussion') url = '/discussions';
      await API.post(url, { title, content });
      alert('Posted successfully');
      setTitle(''); setContent(''); setCategory('Suggestion');
      onClose();
    }catch(err){
      console.error(err);
      alert('Failed to post');
    }finally{ setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>New Post</h3>
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="Suggestion">Suggestion</option>
          <option value="Discussion">Discussion</option>
          <option value="Concern">Concern</option>
        </select>
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <label>Content</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onPost} disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
        </div>
      </div>
    </div>
  );
}
