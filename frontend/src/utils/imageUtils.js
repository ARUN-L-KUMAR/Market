/**
 * Utility to handle product image fallbacks for broken manufacturer CDNs.
 * Returns a high-quality Unsplash image based on product category and title.
 */
export const getProductImageUrl = (product, imageIndex = 0) => {
    if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

    const url = product.images?.[imageIndex]?.url || product.images?.[0]?.url;
    const title = (product.title || '').toLowerCase();
    const categoryName = Array.isArray(product.categoryName) ? product.categoryName[0] : (product.category?.name || product.category || '');
    const cat = (categoryName || '').toLowerCase();
    const combined = `${cat} ${title}`;

    // Comprehensive check for broken manufacturer CDNs and placeholder patterns
    const isBrokenDomain = url && (
        url.includes('static.pub') ||
        url.includes('honor-cdn.com') ||
        url.includes('appmifile.com') ||
        url.includes('hp.com') ||
        url.includes('acer.com') ||
        url.includes('nothing.tech') ||
        url.includes('apple.com') ||
        url.includes('motorola-cdn.com') ||
        url.includes('boat-lifestyle.com') ||
        url.includes('gonoise.com') ||
        url.includes('sony.scene7.com') ||
        url.includes('image01.oneplus.net') ||
        url.includes('placehold.co') ||
        url.includes('samsung.com') ||
        url.includes('garmin.com') ||
        url.includes('noise.in') ||
        url.includes('amazon-adsystem.com') ||
        url.includes('m.media-amazon.com') ||
        !url.includes('://')
    );

    if (!url || isBrokenDomain) {
        if (combined.includes('watch')) return 'https://images.unsplash.com/photo-1546868871-70c122469d8b?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('phone') || combined.includes('mobile') || combined.includes('s24')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('laptop') || combined.includes('macbook') || combined.includes('book')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('headphone') || combined.includes('earbud') || combined.includes('pods') || combined.includes('buds') || combined.includes('audio')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('shoe') || combined.includes('sneaker') || combined.includes('footwear')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('camera') || combined.includes('lens')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('backpack') || combined.includes('bag')) return 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('tablet') || combined.includes('ipad') || combined.includes('pad')) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('speaker') || combined.includes('soundbar')) return 'https://images.unsplash.com/photo-1589003020683-756009585670?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('kitchen') || combined.includes('cook')) return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800';
        if (combined.includes('shirt') || combined.includes('clothing') || combined.includes('t-shirt')) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
    }

    return url;
};
