import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Header from '../components/Header';
import '../styles/EventsPage.css';

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('recent');
  const [query, setQuery] = useState('');
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [comments, setComments] = useState({});
  const [drafts, setDrafts] = useState({});
  const baseApi = (process.env.REACT_APP_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

  useEffect(() => {
    API.get('/events')
      .then(r => {
        const base = r.data || [];
        const normalized = base.map(e => ({
          ...e,
          likes: e.likes ?? 0,
          comments_count: e.comments_count ?? 0,
          liked: !!e.user_liked,
        }));
        setItems(normalized);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (tab === 'recent') {
      list = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (tab === 'popular') {
      list = [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    if (!q) return list;
    return list.filter(
      e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
    );
  }, [items, tab, query]);

  const onToggleLike = (id) => {
    API.post(`/likes/event/${id}/toggle`)
      .then(r => {
        const { count, liked } = r.data || {};
        setItems(prev => prev.map(e => (
          e.id === id ? { ...e, likes: count ?? e.likes, liked: liked ?? e.liked } : e
        )));
      })
      .catch(err => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) alert('Please log in to like this event.');
        else console.error(err);
      });
  };

  const onOpenComments = async (id) => {
    setOpenCommentsFor(id);
    if (!comments[id]) {
      try {
        const r = await API.get(`/comments/event/${id}`);
        setComments(prev => ({ ...prev, [id]: r.data }));
      } catch (e) {
        console.error(e);
        setComments(prev => ({ ...prev, [id]: [] }));
      }
    }
  };

  const onSubmitComment = async (id) => {
    const content = (drafts[id] || '').trim();
    if (!content) return;
    try {
      const r = await API.post(`/comments/event/${id}`, { content });
      setComments(prev => ({ ...prev, [id]: [ ...(prev[id] || []), r.data ] }));
      setDrafts(prev => ({ ...prev, [id]: '' }));
      setItems(prev => prev.map(e => (e.id === id ? { ...e, comments_count: (e.comments_count ?? 0) + 1 } : e)));
    } catch (e) {
      console.error(e);
      alert('Failed to post comment. Please log in.');
    }
  };

  return (
    <div className="events-page">
      <Header showSearch onSearch={setQuery} />

      <div className="events-container">
        <div className="events-topbar">
          <Link to="/" className="back-button" aria-label="Go back">
            <span className="back-icon">&lt;</span>
          </Link>
          <div>
            <h2 className="page-title">Community Events</h2>
            <p className="page-subtitle">Upcoming and ongoing barangay activities</p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            All Events
          </button>
          <button
            className={`tab ${tab === 'recent' ? 'active' : ''}`}
            onClick={() => setTab('recent')}
          >
            Recent
          </button>
          <button
            className={`tab ${tab === 'popular' ? 'active' : ''}`}
            onClick={() => setTab('popular')}
          >
            Popular
          </button>
        </div>

        <div className="cards">
          {filtered.map(e => {
            const authorAvatar = e.author_avatar || e.avatar || e.user_avatar;
            const authorName = e.author_name || e.name || 'Barangay Admin';
            return (
            <article className="card" key={e.id}>
              <div className="card-header">
                <div className="author">
                  <div className="avatar" aria-hidden>
                    {authorAvatar ? (
                      <img src={authorAvatar.startsWith('http') ? authorAvatar : `${baseApi}${authorAvatar}`} alt="avatar" />
                    ) : (
                      <span className="avatar-fallback">📅</span>
                    )}
                  </div>
                  <div className="author-meta">
                    <div className="author-line">
                      <span className="author-name">{authorName}</span>
                      <span className="dot">•</span>
                      <span className="time">
                        {formatRelativeTime(e.created_at)}
                      </span>
                    </div>
                    <span className="badge">Event</span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">{e.title}</h3>
                <p className="card-text">{e.description}</p>
                {e.event_date && (
                  <div className="details">
                    <div><strong>Date:</strong> {new Date(e.event_date).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button className={`metric btn-metric ${e.liked ? 'liked' : ''}`} onClick={() => onToggleLike(e.id)} aria-label="Like">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span className="metric-count">{e.likes ?? 0}</span>
                </button>
                <button className="metric btn-metric" onClick={() => onOpenComments(e.id)} aria-label="Comments">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="metric-count">{e.comments_count ?? 0}</span>
                </button>
              </div>

              {openCommentsFor === e.id && (
                <div className="comments">
                  <div className="comments-list">
                    {(comments[e.id] || []).map(c => {
                      const cAvatar = c.author_avatar || c.avatar || c.user_avatar;
                      const cName = c.author || c.name || 'User';
                      return (
                      <div className="comment" key={c.id}>
                        <div className="comment-avatar" aria-hidden>
                          {cAvatar ? (
                            <img src={cAvatar.startsWith('http') ? cAvatar : `${baseApi}${cAvatar}`} alt="avatar" />
                          ) : (
                            <span className="avatar-fallback">👤</span>
                          )}
                        </div>
                        <div className="comment-body">
                          <div className="comment-meta">
                            <span className="comment-author">{cName}</span>
                            <span className="dot">•</span>
                            <span className="time">{formatRelativeTime(c.created_at)}</span>
                          </div>
                          <div className="comment-content">{c.content}</div>
                        </div>
                      </div>
                      );
                    })}
                    {(comments[e.id] || []).length === 0 && (
                      <div className="comment-empty">No comments yet.</div>
                    )}
                  </div>
                  <div className="comment-form">
                    <input
                      value={drafts[e.id] || ''}
                      onChange={ev => setDrafts(prev => ({ ...prev, [e.id]: ev.target.value }))}
                      placeholder="Write a comment..."
                    />
                    <button onClick={() => onSubmitComment(e.id)}>Post</button>
                  </div>
                </div>
              )}
            </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty">No events found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(iso) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} Mins Ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} Hours Ago`;
    return d.toLocaleDateString();
  } catch {
    return '—';
  }
}
