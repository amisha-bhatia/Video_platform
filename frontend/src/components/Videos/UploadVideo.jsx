import { useState } from 'react';
import { uploadVideo as uploadVideoAPI } from '../../api/video';

export const UploadVideo = ({ onUploaded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);

  const categories = ['diecast', 'kakou', 'kumitate', 'kaihatsu'];

  const handleUpload = async () => {
    if (!title || !category || !file) return alert('All fields are required');
    const token = localStorage.getItem('token');
    await uploadVideoAPI({ title, description, category, file, token });
    setTitle('');
    setDescription('');
    setCategory('');
    setFile(null);
    onUploaded();
  };

  return (
    <div className="card upload-card">
      <h3>Upload Training Video</h3>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">Select category</option>
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};
