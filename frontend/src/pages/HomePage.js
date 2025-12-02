import React, { useEffect, useState } from 'react';
import API from '../api';
import Header from '../components/Header';
import NewPostModal from '../components/NewPostModal';
import './home.css';

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [recentAdminPosts, setRecentAdminPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    API.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {});
    // fetch recent admin posts - using announcements as example
    API.get('/announcements?limit=5').then(r => setRecentAdminPosts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <Header onOpenNewPost={() => setModalOpen(true)} />

      <div className="home-tiles">
        <div className="tile" onClick={() => window.location.href = '/announcements'}>Announcements</div>
        <div className="tile" onClick={() => window.location.href = '/events'}>Community Events</div>
        <div className="tile" onClick={() => window.location.href = '/concerns'}>Concerns & Issues</div>
        <div className="tile" onClick={() => window.location.href = '/suggestions'}>Suggestions</div>
        <div className="tile" onClick={() => window.location.href = '/discussions'}>General Discussion</div>
      </div>

      <section className="recent-section">
        <h2>Recent Admin Posts</h2>
        <div className="recent-list">
          {recentAdminPosts.map(a => (
            <article key={a.id} className="recent-item">
              <h4>{a.title}</h4>
              <p>{a.content}</p>
            </article>
          ))}
        </div>
      </section>

      <NewPostModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
