import React, { useEffect, useState } from 'react';
import API from '../api';
import Header from '../components/Header';
import NewPostModal from '../components/NewPostModal';
import '../styles/home.css';

export default function HomePage() {
  const [, setAnnouncements] = useState([]);
  const [recentAdminPosts, setRecentAdminPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const tiles = [
    {
      title: 'Announcements',
      subtitle: 'Official barangay announcements and updates',
      to: '/announcements',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 10.5c0 1.38 1.12 2.5 2.5 2.5H7v3.5a1.5 1.5 0 0 0 3 0V13h1l7 3V4L11 7H7.5A2.5 2.5 0 0 0 3 9.5v1Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 5v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'Community Events',
      subtitle: 'Upcoming events and activities in the barangay',
      to: '/events',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="6" width="16" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 3v4M15 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 14h4m-4 3h2m4-3h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'Concerns & Issues',
      subtitle: 'Report issues and concerns in the community',
      to: '/concerns',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.8" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Suggestions',
      subtitle: 'Share your ideas for barangay improvement',
      to: '/suggestions',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 3a6 6 0 0 0-6 6c0 2.1 1.06 3.6 2.34 4.87.7.7 1.1 1.66 1.16 2.67V19a1 1 0 0 0 1 1h1m0 0h1a1 1 0 0 0 1-1v-1.46c.06-1 .46-1.97 1.16-2.67C16.94 12.6 18 11.1 18 9a6 6 0 0 0-6-6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'General Discussion',
      subtitle: 'General topics and community conversations',
      to: '/discussions',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 6h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-4 4V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    API.get('/announcements')
      .then(r => setAnnouncements(r.data))
      .catch(() => {});

    API.get('/announcements?limit=1')
      .then(r => setRecentAdminPosts(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <Header onOpenNewPost={() => setModalOpen(true)} />

      {/* Hero section with welcome text only */}
      <div className="home-hero">
        <h1 className="hero-title">Welcome to Barangay Forum</h1>
        <p className="hero-subtitle">Connect with your neighbors, stay informed, and participate in community discussions.</p>
      </div>

      {/* Tiles below hero, centered */}
      <div className="home-tiles-row-1">
        {tiles.slice(0, 3).map(tile => (
          <button
            key={tile.title}
            className="tile"
            onClick={() => (window.location.href = tile.to)}
            aria-label={tile.title}
            type="button"
          >
            <span className="tile-icon" aria-hidden>
              {tile.icon}
            </span>
            <span className="tile-text">
              <span className="tile-title">{tile.title}</span>
              <span className="tile-subtitle">{tile.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="home-tiles-row-2">
        {tiles.slice(3).map(tile => (
          <button
            key={tile.title}
            className="tile"
            onClick={() => (window.location.href = tile.to)}
            aria-label={tile.title}
            type="button"
          >
            <span className="tile-icon" aria-hidden>
              {tile.icon}
            </span>
            <span className="tile-text">
              <span className="tile-title">{tile.title}</span>
              <span className="tile-subtitle">{tile.subtitle}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Recent Admin Posts Section */}
      <section className="recent-section">
        <h2>Recent Post</h2>
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
