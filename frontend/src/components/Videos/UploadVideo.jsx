import { useState, useCallback, useMemo } from 'react';
import { uploadVideo as uploadVideoAPI } from '../../api/video';
import '../Styles/UploadVideo.css';

export const UploadVideo = ({ onUploaded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = useMemo(() => [
    { value: 'diecast', label: 'Diecast' },
    { value: 'kakou', label: '加工 (Processing)' },
    { value: 'kumitate', label: '組立 (Assembly)' },
    { value: 'kaihatsu', label: '開発 (Development)' }
  ], []);

  const validateFile = useCallback((file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const maxSize = 500 * 1024 * 1024; // 500MB
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid video file (MP4, WebM, OGG, MOV)';
    }
    
    if (file.size > maxSize) {
      return 'File size must be less than 500MB';
    }
    
    return null;
  }, []);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        e.target.value = ''; // Reset input
        return;
      }
      setFile(selectedFile);
    }
  }, [validateFile]);

  const handleUpload = useCallback(async (e) => {
    e?.preventDefault();

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!file) {
      setError('Please select a video file');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please login again.');
      setIsUploading(false);
      return;
    }

    try {
      // Simulate progress (if API doesn't support progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await uploadVideoAPI({ 
        title: title.trim(), 
        description: description.trim(), 
        category, 
        file, 
        token 
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      onUploaded?.();
      
      // Clear progress after success
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [title, description, category, file, onUploaded]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
      
      // Update file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInput.files = dataTransfer.files;
      }
    }
  }, [validateFile]);

  const isFormValid = title.trim() && category && file;

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h2>Upload Training Video</h2>
          <p className="upload-subtitle">Share knowledge with your team</p>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Introduction to Diecast Manufacturing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Describe what this video covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Select a category</option>
              {categories.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="file">Video File *</label>
            <div 
              className={`file-drop-zone ${file ? 'has-file' : ''} ${isUploading ? 'disabled' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                id="file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              {file ? (
                <div className="file-info">
                  <span className="file-icon">📹</span>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => {
                        setFile(null);
                        const input = document.getElementById('file');
                        if (input) input.value = '';
                      }}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div className="drop-zone-content">
                  <span className="upload-icon">📁</span>
                  <p>Drag & drop or <span className="browse-text">browse</span></p>
                  <span className="file-hint">Supports: MP4, WebM, OGG, MOV (Max 500MB)</span>
                </div>
              )}
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="progress-container">
              <div className="progress-header">
                <span className="progress-label">Uploading...</span>
                <span className="progress-percentage">{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setTitle('');
                setDescription('');
                setCategory('');
                setFile(null);
                setError('');
                const input = document.getElementById('file');
                if (input) input.value = '';
              }}
              disabled={isUploading}
            >
              Clear
            </button>
            <button
              type="submit"
              className={`upload-btn ${isUploading ? 'uploading' : ''}`}
              disabled={!isFormValid || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spinner" />
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </button>
          </div>
        </form>

        <div className="upload-footer">
          <p className="guidelines-hint">
            📋 Make sure your video follows the training content guidelines
          </p>
        </div>
      </div>
    </div>
  );
};