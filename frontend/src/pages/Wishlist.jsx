import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, removeFromWishlistAsync } from '../store/wishlistSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';
import { addToCart } from '../store/cartSlice';
import WishlistRecommendations from '../components/WishlistRecommendations';
import WishlistIcon from '../components/WishlistIcon';
import Badge from '../components/ui/Badge';
import { useRef } from 'react';
import { addToWishlistAsync } from '../store/wishlistSlice';
import CurrencyPrice from '../components/CurrencyPrice';

const EmptyWishlistIllustration = () => (
  <div className="flex flex-col items-center justify-center mb-6">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-200 mb-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
    <h2 className="text-xl font-semibold mb-2">Your wishlist is empty!</h2>
    <p className="mb-4 text-gray-500">Browse products and add your favorites to your wishlist.</p>
    <Button onClick={() => window.location.href = '/products'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.9-.55L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>}>Browse Products</Button>
  </div>
);

const Wishlist = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.user);
  const { items: wishlistItems, loading } = useSelector(state => state.wishlist);
  const isAuthenticated = user && token;

  const [sortBy, setSortBy] = useState('date');
  const [recentlyRemoved, setRecentlyRemoved] = useState(null);
  const undoTimeoutRef = useRef(null);

  // Sorting logic
  const sortedWishlistItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    // Default: date (assuming _id is monotonic)
    return b._id.localeCompare(a._id);
  });

  // Share wishlist link
  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Wishlist link copied to clipboard!');
  };

  // Undo remove logic
  const handleRemoveFromWishlist = async (productId) => {
    const removedProduct = wishlistItems.find(p => p._id === productId);
    setRecentlyRemoved(removedProduct);
    await dispatch(removeFromWishlistAsync(productId)).unwrap();
    toast(
      <span>
        Removed from wishlist. <Button variant="link" onClick={handleUndoRemove} disabled={!recentlyRemoved}>Undo</Button>
      </span>,
      { autoClose: 5000, onClose: () => setRecentlyRemoved(null) }
    );
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => setRecentlyRemoved(null), 5000);
  };
  const handleUndoRemove = async () => {
    if (recentlyRemoved) {
      await dispatch(addToWishlistAsync(recentlyRemoved)).unwrap();
      setRecentlyRemoved(null);
      toast.success('Product restored to wishlist!');
    }
  };

  const handleAddToCart = (product) => {
    if (!product.inStock) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({
      product,
      quantity: 1
    }));
    toast.success(`${product.title} added to cart`);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, token, dispatch]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {loading ? (
        <div>Loading...</div>
      ) : wishlistItems.length === 0 ? (
        <EmptyWishlistIllustration />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShareWishlist}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>}
                aria-label="Share wishlist"
                title="Copy wishlist link"
              >
                Share
              </Button>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
                aria-label="Sort wishlist"
              >
                <option value="date">Sort by: Recently Added</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10 transition-all duration-300">
            {sortedWishlistItems.map(product => {
              const mainImage = product.images && product.images.length > 0
                ? (product.images.find(img => img.isPrimary) || product.images[0])
                : null;
              return (
                <Card key={product._id} hover shadow="md" className="flex flex-col h-full relative group transition-transform duration-200">
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistIcon product={product} size="md" />
                  </div>
                  {/* Stock Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge color={product.inStock ? 'success' : 'danger'} size="sm">
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <img
                    src={mainImage ? mainImage.url : 'https://placehold.co/400x300?text=No+Image'}
                    alt={mainImage && mainImage.alt ? mainImage.alt : product.title}
                    onError={e => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                    className="w-full h-48 object-cover rounded-t-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 line-clamp-2">{product.title}</h3>
                      <p className="text-primary-600 font-bold mb-2 text-lg"><CurrencyPrice price={product.price || 0} /></p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="flex-1"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.9-.55L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>}
                        aria-label="Add to cart"
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="flex-1"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          {/* Recommendations below wishlist */}
          <WishlistRecommendations wishlistItems={wishlistItems} />
        </>
      )}
    </div>
  );
};

export default Wishlist;
