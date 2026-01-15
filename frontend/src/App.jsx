import { useState, useEffect } from 'react';
import './App.css';

const BASE_URL = 'https://video-platform-tz2j.onrender.com'; // Render backend

function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [page, setPage] = useState('home');

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');

  const categories = ['diecast', 'kakou', 'kumitate', 'kaihatsu'];

  // ===== LOGIN =====
  const login = async () => {
    setError('');
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });

    if (!res.ok) {
      setError('Invalid ID or password');
      return;
    }

    const data = await res.json();
    setUser(data);
    fetchVideos();
  };

  const logout = () => {
    setUser(null);
    setSelectedVideo(null);
    setSelectedCategory(null);
    setPage('home');
  };

  // ===== FETCH VIDEOS =====
  const fetchVideos = async () => {
    const res = await fetch(`${BASE_URL}/api/videos`);
    setVideos(await res.json());
  };

  // ===== UPLOAD VIDEO =====
  const uploadVideo = async () => {
    if (!title || !file || !category) {
      alert('Title, file, and category are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('video', file);

    const res = await fetch(`${BASE_URL}/api/videos`, {
      method: 'POST',
      headers: { 'x-role': user.role },
      body: formData
    });

    if (!res.ok) {
      alert('Upload failed');
      return;
    }

    setTitle('');
    setDescription('');
    setFile(null);
    setCategory('');
    setPage('home');
    fetchVideos();
  };

  // ===== DELETE VIDEO =====
  const deleteVideo = async () => {
    if (!window.confirm('Delete this video?')) return;

    const res = await fetch(`${BASE_URL}/api/videos/${selectedVideo.id}`, {
      method: 'DELETE',
      headers: { 'x-role': user.role }
    });

    if (!res.ok) {
      alert('Delete failed');
      return;
    }

    setSelectedVideo(null);
    fetchVideos();
  };

  // ===== LOGIN VIEW =====
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Training Portal</h2>
          <input
            placeholder="User ID"
            value={id}
            onChange={e => setId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={login}>Login</button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  // ===== MAIN VIEW =====
  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="brand">Training Portal</div>

        <div className="nav-center">
          <button
            className={page === 'home' ? 'nav-link active' : 'nav-link'}
            onClick={() => {
              setSelectedVideo(null);
              setSelectedCategory(null);
              setPage('home');
            }}
          >
            Home
          </button>

          {user.role === 'admin' && (
            <button
              className={page === 'upload' ? 'nav-link active' : 'nav-link'}
              onClick={() => {
                setSelectedVideo(null);
                setSelectedCategory(null);
                setPage('upload');
              }}
            >
              Upload
            </button>
          )}
        </div>

        <div className="nav-right">
          <span>{user.id}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        {/* ===== UPLOAD PAGE ===== */}
        {page === 'upload' && user.role === 'admin' && (
          <div className="card">
            <h3>Upload Training Video</h3>
            <input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button onClick={uploadVideo}>Upload</button>
          </div>
        )}

        {/* ===== HOME PAGE ===== */}
        {page === 'home' && !selectedVideo && !selectedCategory && (
          <div className="categories">
            <h2>Select Category</h2>
            <div className="list">
              {categories.map(cat => (
                <div
                  key={cat}
                  className="list-item"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== CATEGORY VIDEOS VIEW ===== */}
        {page === 'home' && !selectedVideo && selectedCategory && (
          <div className="categories">
            <button className="back" onClick={() => setSelectedCategory(null)}>← Back to Categories</button>
            <h2>{selectedCategory}</h2>
            <div className="list">
              {videos
                .filter(v => v.category === selectedCategory)
                .map(video => (
                  <div
                    key={video.id}
                    className="list-item"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {video.title}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ===== VIDEO DETAIL ===== */}
        {page === 'home' && selectedVideo && (
          <div className="detail">
            <button className="back" onClick={() => setSelectedVideo(null)}>← Back</button>
            <h2>{selectedVideo.title}</h2>
            <p className="description">{selectedVideo.description}</p>
            {user.role === 'admin' && (
              <button className="delete" onClick={deleteVideo}>🗑️ Delete Video</button>
            )}
            <video
              controls
              src={`${BASE_URL}/uploads/${selectedVideo.filename}`}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
