import React, { useState } from 'react';
import API from '../api';

export default function ConcernsPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/concerns', { subject, message });
      setSubject(''); setMessage('');
      alert('Concern submitted');
    } catch (err) {
      alert('You must be logged in to submit a private concern');
    }
  };

  return (
    <div>
      <h2>Concerns & Issues (Private)</h2>
      <form onSubmit={submit}>
        <input placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
