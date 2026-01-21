const BASE_URL = 'http://localhost:4000';

export const loginUser = async (id, password) => {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password }),
  });
  return res.ok ? await res.json() : null;
};

export const fetchVideos = async (token) => {
  const res = await fetch(`${BASE_URL}/api/videos`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.ok ? await res.json() : [];
};

export const saveProgress = async ({ token, videoId, lastPosition, duration }) => {
  const res = await fetch(`${BASE_URL}/api/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ videoId, lastPosition, duration }),
  });
  return res.ok;
};

export const fetchProgress = async (videoIds, token) => {
  const res = await fetch(
    `http://localhost:4000/api/progress?videoIds=${videoIds.join(',')}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
};

export const uploadVideo = async ({ token, title, description, category, file }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  formData.append('category', category);
  formData.append('video', file);

  const res = await fetch(`${BASE_URL}/api/videos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload failed');
  }

  return await res.json();
};