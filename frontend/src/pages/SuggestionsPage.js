import React, { useEffect, useState } from 'react';
import API from '../api';

export default function SuggestionsPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentsCache, setCommentsCache] = useState({});
  const [likesCache, setLikesCache] = useState({});

  useEffect(() => {
    API.get('/suggestions').then(r => setItems(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/suggestions', { title, content });
      setTitle(''); setContent('');
      const r = await API.get('/suggestions');
      setItems(r.data);
    } catch (err) {
      alert('You must be logged in to post a suggestion');
    }
  };

  const loadComments = async (id) => {
    const r = await API.get(`/comments/suggestion/${id}`);
    setCommentsCache(prev => ({ ...prev, [id]: r.data }));
  };

  const postComment = async (id, text) => {
    await API.post(`/comments/suggestion/${id}`, { content: text });
    await loadComments(id);
  };

  const loadLikes = async (id) => {
    const r = await API.get(`/likes/suggestion/${id}`);
    setLikesCache(prev => ({ ...prev, [id]: r.data }));
  };

  const toggleLike = async (id) => {
    const r = await API.post(`/likes/suggestion/${id}/toggle`);
    setLikesCache(prev => ({ ...prev, [id]: { count: r.data.count, userLiked: r.data.liked } }));
  };

  return (
    <div>
      <h2>Suggestions</h2>
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} />
        <button type="submit">Post</button>
      </form>
      {items.map(s => (
        <article key={s.id}>
          <h3>{s.title}</h3>
          <p>{s.content}</p>
          <small>By: {s.author}</small>
          <div>
            <button onClick={() => { loadLikes(s.id); loadComments(s.id); }}>Show interactions</button>
            <button onClick={() => toggleLike(s.id)}>Like ({likesCache[s.id]?.count ?? '-'})</button>
          </div>
          <div>
            {(commentsCache[s.id] || []).map(c => (
              <div key={c.id}><strong>{c.author}</strong>: {c.content}</div>
            ))}
            <CommentForm onPost={(text)=>postComment(s.id, text)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function CommentForm({ onPost }){
  const [text, setText] = useState('');
  return (
    <div>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment" />
      <button onClick={async ()=>{ if(text.trim()){ await onPost(text); setText(''); } }}>Post</button>
    </div>
  );
}
