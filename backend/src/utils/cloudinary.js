const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Extract publicId from a Cloudinary URL
 * e.g. https://res.cloudinary.com/dxo35vqwm/image/upload/v1733008123/products/image.jpg
 *      → publicId = "products/image"
 */
function extractPublicId(url) {
    if (!url || typeof url !== 'string') return null;

    try {
        // Match Cloudinary URL pattern: .../upload/v{version}/{publicId}.{ext}
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        if (match && match[1]) {
            return match[1];
        }

        // Fallback: try to match without /upload/ (for fetched URLs)
        const fetchMatch = url.match(/\/image\/(?:upload|fetch)\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        if (fetchMatch && fetchMatch[1]) {
            return fetchMatch[1];
        }
    } catch (err) {
        console.error('Failed to extract publicId from URL:', url, err.message);
    }

    return null;
}

/**
 * Upload an image to Cloudinary
 * @param {string} fileInput - file path, URL, or base64 data URI
 * @param {Object} options - upload options
 * @returns {Object} { url, publicId, width, height }
 */
async function uploadImage(fileInput, options = {}) {
    const uploadOptions = {
        folder: options.folder || 'products',
        resource_type: 'image',
        transformation: options.transformation || [
            { quality: 'auto', fetch_format: 'auto' }
        ],
        ...options
    };

    const result = await cloudinary.uploader.upload(fileInput, uploadOptions);

    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
    };
}

/**
 * Delete an image from Cloudinary by publicId or URL
 * @param {string} publicIdOrUrl - the publicId or full Cloudinary URL
 * @returns {Object} result with { result: 'ok' | 'not found' }
 */
async function deleteImage(publicIdOrUrl) {
    let publicId = publicIdOrUrl;

    // If it looks like a URL, extract the publicId
    if (publicIdOrUrl && publicIdOrUrl.startsWith('http')) {
        publicId = extractPublicId(publicIdOrUrl);
    }

    if (!publicId) {
        console.warn('Cannot delete image — no publicId found for:', publicIdOrUrl);
        return { result: 'not found' };
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (err) {
        console.error(`Failed to delete Cloudinary image ${publicId}:`, err.message);
        return { result: 'error', error: err.message };
    }
}

/**
 * Delete multiple images from Cloudinary
 * @param {Array} images - array of { publicId, url } objects
 */
async function deleteImages(images) {
    if (!images || images.length === 0) return;

    const results = await Promise.allSettled(
        images.map(img => {
            const id = img.publicId || extractPublicId(img.url);
            if (id) return cloudinary.uploader.destroy(id);
            return Promise.resolve({ result: 'skipped' });
        })
    );

    const deleted = results.filter(r => r.status === 'fulfilled' && r.value?.result === 'ok').length;
    if (deleted > 0) {
        console.log(`Cleaned up ${deleted}/${images.length} Cloudinary images`);
    }

    return results;
}

module.exports = {
    cloudinary,
    uploadImage,
    deleteImage,
    deleteImages,
    extractPublicId
};
