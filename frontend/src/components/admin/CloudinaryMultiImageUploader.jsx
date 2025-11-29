import React, { useRef, useState } from 'react';
import { uploadImage } from '../../utils/cloudinaryClient';
import Button from '../ui/Button';

const CloudinaryMultiImageUploader = ({ productId, images = [], onChange }) => {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle file selection or drop
  const handleFiles = async (files) => {
    setError('');
    setUploading(true);
    const uploadedImages = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 10MB)`);
        }

        const result = await uploadImage(file);
        uploadedImages.push({ 
          url: result.url, 
          alt: file.name,
          isPrimary: false
          // publicId: result.publicId  // Temporarily removed for compatibility
        });
      } catch (err) {
        setError(err.message || 'Upload failed');
        console.error('Upload error:', err);
      }
    }

    setUploading(false);
    if (uploadedImages.length > 0) {
      onChange([...(images || []), ...uploadedImages]);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Remove image before saving
  const handleRemove = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    onChange(newImages);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition hover:border-primary-500 ${uploading ? 'opacity-60' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{ minHeight: 100 }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div className="text-gray-500">
          {uploading ? 'Uploading...' : 'Drag & drop images here, or click to select'}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Max 10MB per image • JPG, PNG, GIF, WebP
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {images && images.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={img.url} 
                alt={img.alt || 'Product'} 
                className="h-20 w-20 object-cover rounded shadow" 
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                onClick={e => { 
                  e.stopPropagation(); 
                  handleRemove(idx); 
                }}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudinaryMultiImageUploader;
