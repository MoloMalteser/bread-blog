import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pzrdesbjuxykihqumrvi.supabase',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRlc2JqdXh5a2locXVtcnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTQ4NTQsImV4cCI6MjA2NzI3MDg1NH0.NmcR-aSKElAAJYmqLsPE6QHbYDefZRG4SkN32PkCAp0'
);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'HerrMogli!2012';

const Admin = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [error, setError] = useState('');

  const login = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      fetchData();
    } else {
      setError('Falscher Benutzername oder Passwort.');
    }
  };

  const fetchData = async () => {
    const { data: postsData, error: postsError } = await supabase.from('posts').select('*');
    const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');

    if (postsError || profilesError) {
      setError('Fehler beim Laden der Daten.');
    } else {
      setPosts(postsData || []);
      setProfiles(profilesData || []);
    }
  };

  const handleUpdatePost = async (postId: string, content: string) => {
    await supabase.from('posts').update({ content }).eq('id', postId);
    fetchData(); // reload
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={login}>Einloggen</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Admin Dashboard</h2>

      <h3>Posts</h3>
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <p><strong>Titel:</strong> {post.title}</p>
          <p><strong>Autor:</strong> {post.author_id}</p>
          <textarea
            value={post.content}
            onChange={(e) => handleUpdatePost(post.id, e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
          <button onClick={() => handleUpdatePost(post.id, post.content)}>Aktualisieren</button>
        </div>
      ))}

      <h3>Profiles</h3>
      {profiles.map((profile) => (
        <div key={profile.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
        </div>
      ))}
    </div>
  );
};

export default Admin;
