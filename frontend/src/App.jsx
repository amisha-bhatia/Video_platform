import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { fetchVideos } from './api/video';

import { LoginForm } from './components/Auth/LoginForm';
import { Navbar } from './components/Navbar/Navbar';
import { VideoList } from './components/Videos/VideoList';
import { VideoPlayer } from './components/Videos/VideoPlayer';
import { UploadVideo } from './components/Videos/UploadVideo';

import './App.css';

/* ---------------- PAGES ---------------- */

const CategoriesPage = () => {
  const navigate = useNavigate();
  const categories = ['diecast', 'kakou', 'kumitate', 'kaihatsu'];

  return (
    <div className="categories">
      <h2>Categories</h2>
      <div className="category-list">
        {categories.map(cat => (
          <div
            key={cat}
            className="category-item"
            onClick={() => navigate(`/${cat}`)}
          >
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryVideosPage = ({ videos }) => {
  const { category } = useParams();
  const navigate = useNavigate();

  const filtered = videos.filter(v => v.category === category);

  return (
    <div>
      <h2>{category}</h2>

      <VideoList
        videos={filtered}
        onSelect={video =>
          navigate(`/${category}/${video.id}`)
        }
        token={localStorage.getItem('token')}
      />
    </div>
  );
};

const VideoPage = ({ videos }) => {
  const { category, videoId } = useParams();

  const video = videos.find(v => String(v.id) === videoId);

  if (!video) return <p>Video not found</p>;

  return (
    <div className="video-detail">
      <h2>{video.title}</h2>
      <p>{video.description}</p>
      <VideoPlayer
        video={video}
        token={localStorage.getItem('token')}
      />
    </div>
  );
};

/* ---------------- APP ---------------- */

function App() {
  const { user, setUser, logout } = useAuth();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchVideos(localStorage.getItem('token')).then(setVideos);
  }, [user]);

  if (!user) return <LoginForm setUser={setUser} />;

  return (
    <Router>
      <Navbar user={user} logout={logout} />

      <Routes>
        <Route path="/" element={<CategoriesPage />} />
        <Route path="/:category" element={<CategoryVideosPage videos={videos} />} />
        <Route path="/:category/:videoId" element={<VideoPage videos={videos} />} />

        {user.role === 'admin' && (
          <Route
            path="/upload"
            element={
              <UploadVideo
                onUploaded={() =>
                  fetchVideos(localStorage.getItem('token')).then(setVideos)
                }
              />
            }
          />
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
