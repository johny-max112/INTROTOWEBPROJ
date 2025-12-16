import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import AuthContext from '../auth/AuthContext';
import Header from '../components/Header';
import '../styles/ConcernsPage.css';

export default function ConcernsPage() {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Fetch concerns on load
  useEffect(() => {
    fetchConcerns();
  }, []);

  const fetchConcerns = async () => {
    setLoading(true);
    try {
      const r = await API.get('/concerns');
      setConcerns(r.data || []);
    } catch (err) {
      console.error(err);
      setConcerns([]);
    }
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both fields');
      return;
    }
    try {
      await API.post('/concerns', { subject, message });
      setSubject('');
      setMessage('');
      alert('Concern submitted successfully');
      fetchConcerns(); // Refresh list
    } catch (err) {
      alert('You must be logged in to submit a concern');
    }
  };

  const replyToConcern = async (concernId) => {
    const reply = prompt('Enter your reply:');
    if (!reply || !reply.trim()) return;
    try {
      await API.post(`/concerns/${concernId}/reply`, { message: reply });
      alert('Reply sent');
      fetchConcerns(); // Refresh list
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  return (
    <div className="concerns-page">
      <Header />
      
      <div className="concerns-container">
        <div className="concerns-topbar">
          <Link to="/" className="back-button" aria-label="Go back">
            <span className="back-icon">←</span>
          </Link>
          <div>
            <h2 className="page-title">Concerns & Issues</h2>
            <p className="page-subtitle">Submit and track your community concerns</p>
          </div>
        </div>

        {!isAdmin && (
          <>
            <h3 className="section-title">Submit a Concern</h3>
            <form onSubmit={submit} className="concern-form">
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  placeholder="Brief subject of your concern"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  placeholder="Describe your concern in detail..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-submit">
                Submit Concern
              </button>
            </form>

            <h3 className="section-title">My Submitted Concerns ({concerns.length})</h3>
          </>
        )}

        {isAdmin && (
          <h3 className="section-title">All Submitted Concerns ({concerns.length})</h3>
        )}

        {loading ? (
          <p className="empty">Loading concerns...</p>
        ) : concerns.length === 0 ? (
          <p className="empty">No concerns found.</p>
        ) : (
          <div className="concerns-list">
            {concerns.map(concern => (
              <div key={concern.id} className="concern-card">
                {isAdmin && (
                  <div className="concern-header">
                    <span className="concern-author">From: {concern.author || 'Unknown'}</span>
                  </div>
                )}
                <h4 className="concern-subject">{concern.subject}</h4>
                <p className="concern-message">{concern.message}</p>
                <div className="concern-meta">
                  Submitted: {new Date(concern.created_at).toLocaleString()}
                </div>

                {concern.replies && concern.replies.length > 0 && (
                  <div className="replies-section">
                    <div className="replies-title">Admin Replies</div>
                    {concern.replies.map(reply => (
                      <div key={reply.id} className="reply">
                        <div className="reply-admin">{reply.admin_name}</div>
                        <div className="reply-content">{reply.message}</div>
                        <div className="reply-time">
                          {new Date(reply.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => replyToConcern(concern.id)}
                    className="btn-reply"
                  >
                    Reply to Concern
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
