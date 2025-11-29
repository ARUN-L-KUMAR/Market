// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset'
};

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, publicId: string}>} - The uploaded image URL and public ID
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);

  console.log('📤 Uploading to Cloudinary:', {
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    fileName: file.name,
    fileSize: file.size
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary error response:', errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * Note: This requires backend implementation with Cloudinary SDK
 * as deletion needs authentication
 * @param {string} publicId - The public ID of the image to delete
 */
export const deleteImage = async (publicId) => {
  // This should be called from your backend
  console.warn('Image deletion should be handled by backend');
  // You can implement a backend endpoint to handle deletion
};

export { cloudinaryConfig };
