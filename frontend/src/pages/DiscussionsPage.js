import React, { useEffect, useState } from 'react';
import API from '../api';

export default function DiscussionsPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentsCache, setCommentsCache] = useState({});
  const [likesCache, setLikesCache] = useState({});

  useEffect(() => {
    API.get('/discussions').then(r => setItems(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/discussions', { title, content });
      setTitle(''); setContent('');
      const r = await API.get('/discussions');
      setItems(r.data);
    } catch (err) {
      alert('You must be logged in to post a discussion');
    }
  };

  const loadComments = async (id) => {
    const r = await API.get(`/comments/discussion/${id}`);
    setCommentsCache(prev => ({ ...prev, [id]: r.data }));
  };

  const postComment = async (id, text) => {
    await API.post(`/comments/discussion/${id}`, { content: text });
    await loadComments(id);
  };

  const loadLikes = async (id) => {
    const r = await API.get(`/likes/discussion/${id}`);
    setLikesCache(prev => ({ ...prev, [id]: r.data }));
  };

  const toggleLike = async (id) => {
    const r = await API.post(`/likes/discussion/${id}/toggle`);
    setLikesCache(prev => ({ ...prev, [id]: { count: r.data.count, userLiked: r.data.liked } }));
  };

  return (
    <div>
      <h2>Discussions</h2>
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} />
        <button type="submit">Post</button>
      </form>
      {items.map(d => (
        <article key={d.id}>
          <h3>{d.title}</h3>
          <p>{d.content}</p>
          <small>By: {d.author}</small>
          <div>
            <button onClick={() => { loadLikes(d.id); loadComments(d.id); }}>Show interactions</button>
            <button onClick={() => toggleLike(d.id)}>Like ({likesCache[d.id]?.count ?? '-'})</button>
          </div>
          <div>
            {(commentsCache[d.id] || []).map(c => (
              <div key={c.id}><strong>{c.author}</strong>: {c.content}</div>
            ))}
            <CommentForm onPost={(text)=>postComment(d.id, text)} />
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
