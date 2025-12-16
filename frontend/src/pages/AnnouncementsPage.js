import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Header from '../components/Header';
import '../styles/AnnouncementPage.css';

export default function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('recent'); // 'all' | 'recent' | 'popular'
  const [query, setQuery] = useState('');
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [comments, setComments] = useState({}); // { [announcementId]: [ {id, author, content, created_at} ] }
  const [drafts, setDrafts] = useState({}); // { [announcementId]: "text" }

  useEffect(() => {
    API.get('/announcements')
      .then(r => {
        const base = r.data || [];
        const normalized = base.map(a => ({
          ...a,
          likes: a.likes ?? 0,
          comments_count: a.comments_count ?? 0,
          liked: !!a.user_liked,
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
      a =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q)
    );
  }, [items, tab, query]);

  const onToggleLike = (id) => {
    API.post(`/likes/announcement/${id}/toggle`)
      .then(r => {
        const { count, liked } = r.data || {};
        setItems(prev => prev.map(a => (
          a.id === id ? { ...a, likes: count ?? a.likes, liked: liked ?? a.liked } : a
        )));
      })
      .catch(err => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) alert('Please log in to like this announcement.');
        else console.error(err);
      });
  };

  const onOpenComments = async (id) => {
    setOpenCommentsFor(id);
    if (!comments[id]) {
      try {
        const r = await API.get(`/comments/announcement/${id}`);
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
      const r = await API.post(`/comments/announcement/${id}`, { content });
      setComments(prev => ({ ...prev, [id]: [ ...(prev[id] || []), r.data ] }));
      setDrafts(prev => ({ ...prev, [id]: '' }));
      // bump count displayed on card
      setItems(prev => prev.map(a => (a.id === id ? { ...a, comments_count: (a.comments_count ?? 0) + 1 } : a)));
    } catch (e) {
      console.error(e);
      alert('Failed to post comment. Please log in.');
    }
  };

  return (
    <div className="announcement-page">
      <Header showSearch onSearch={setQuery} />

      <div className="announcement-container">
        <div className="announcement-topbar">
          <Link to="/" className="back-button" aria-label="Go back">
            <span className="back-icon">←</span>
          </Link>
          <div>
            <h2 className="page-title">Announcements</h2>
            <p className="page-subtitle">Official news and updates from the barangay</p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            All Post
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
          {filtered.map(a => (
            <article className="card" key={a.id}>
              <div className="card-header">
                <div className="author">
                  <div className="avatar" aria-hidden>
                    {a.author_avatar ? (
                      <img src={a.author_avatar} alt="avatar" />
                    ) : (
                      <span className="avatar-fallback">👤</span>
                    )}
                  </div>
                  <div className="author-meta">
                    <div className="author-line">
                      <span className="author-name">{a.author_name || 'Barangay Admin'}</span>
                      <span className="dot">•</span>
                      <span className="time">
                        {formatRelativeTime(a.created_at)}
                      </span>
                    </div>
                    <span className="badge">Announcement</span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">{a.title}</h3>
                <p className="card-text">{a.content}</p>
                {a.date || a.time || a.venue ? (
                  <div className="details">
                    {a.date && <div><strong>Date:</strong> {a.date}</div>}
                    {a.time && <div><strong>Time:</strong> {a.time}</div>}
                    {a.venue && <div><strong>Venue:</strong> {a.venue}</div>}
                  </div>
                ) : null}
              </div>

              <div className="card-footer">
                <button className={`metric btn-metric ${a.liked ? 'liked' : ''}`} onClick={() => onToggleLike(a.id)} aria-label="Like">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span className="metric-count">{a.likes ?? 0}</span>
                </button>
                <button className="metric btn-metric" onClick={() => onOpenComments(a.id)} aria-label="Comments">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="metric-count">{a.comments_count ?? 0}</span>
                </button>
              </div>

              {openCommentsFor === a.id && (
                <div className="comments">
                  <div className="comments-list">
                    {(comments[a.id] || []).map(c => (
                      <div className="comment" key={c.id}>
                        <div className="comment-meta">
                          <span className="comment-author">{c.author || 'User'}</span>
                          <span className="dot">•</span>
                          <span className="time">{formatRelativeTime(c.created_at)}</span>
                        </div>
                        <div className="comment-content">{c.content}</div>
                      </div>
                    ))}
                    {(comments[a.id] || []).length === 0 && (
                      <div className="comment-empty">No comments yet.</div>
                    )}
                  </div>
                  <div className="comment-form">
                    <input
                      value={drafts[a.id] || ''}
                      onChange={e => setDrafts(prev => ({ ...prev, [a.id]: e.target.value }))}
                      placeholder="Write a comment..."
                    />
                    <button onClick={() => onSubmitComment(a.id)}>Post</button>
                  </div>
                </div>
              )}
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="empty">No announcements found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(iso) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000; // s
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} Mins Ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} Hours Ago`;
    return d.toLocaleDateString();
  } catch {
    return '—';
  }
}


 


