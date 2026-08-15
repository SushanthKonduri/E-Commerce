import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingBag, Plus, Minus, ShieldCheck, Truck, RotateCcw, Check, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.product);
        setRelatedProducts(res.data.relatedProducts || []);
        if (res.data.product?.images?.length > 0) {
          setSelectedImg(res.data.product.images[0].url);
        }
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Sign In Required', message: 'Please sign in to write a review' });
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      addToast({ type: 'success', title: 'Review Submitted', message: 'Thank you for your feedback!' });
      setReviewTitle('');
      setReviewComment('');

      // Reload product details
      const res = await api.get(`/products/${slug}`);
      setProduct(res.data.product);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Review Error',
        message: error.response?.data?.message || 'Could not submit review',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-luxe-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Product Not Found</h2>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl bg-luxe-gold text-black font-semibold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Product Detail Top Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-luxe-card border border-luxe-border shadow-2xl relative">
            <motion.img
              key={selectedImg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedImg || product.images?.[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-luxe-gold text-black">
                New Arrival
              </span>
            )}
          </div>

          {/* Thumbnails Carousel */}
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImg(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImg === img.url ? 'border-luxe-gold scale-105' : 'border-luxe-border opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Category & Rating */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-luxe-gold uppercase tracking-wider font-semibold">
                {product.category?.name || 'Luxury Goods'}
              </span>
              <div className="flex items-center gap-1 text-luxe-gold">
                <Star className="w-4 h-4 fill-luxe-gold" />
                <span className="font-bold text-slate-100">{product.rating.toFixed(1)}</span>
                <span className="text-luxe-muted">({product.reviewCount} customer reviews)</span>
              </div>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-100 leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-4 pt-2 border-b border-luxe-border pb-4">
              <span className="font-heading font-bold text-3xl text-luxe-gold">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-luxe-muted line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                product.stock <= 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {product.stock <= 0 ? 'Out of Stock' : `${product.stock} units available`}
              </span>
            </div>

            <p className="text-sm text-luxe-muted leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector for Footwear */}
            {product.category?.slug === 'footwear' && (
              <div className="pt-2">
                <span className="block text-xs font-semibold text-luxe-muted mb-2">Select Size (US)</span>
                <div className="flex gap-2 flex-wrap">
                  {['7', '8', '9', '10', '11', '12'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${
                        selectedSize === sz
                          ? 'bg-luxe-gold border-luxe-gold text-black shadow-lg shadow-luxe-gold/20'
                          : 'bg-luxe-bg border-luxe-border text-slate-300 hover:border-luxe-gold'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-luxe-border rounded-xl bg-luxe-card p-1">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-100">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={product.stock <= 0 || (product.category?.slug === 'footwear' && !selectedSize)}
                  onClick={(e) => addToCart(product.id, quantity, selectedSize, e)}
                  className="flex-1 py-4 rounded-2xl bg-luxe-gold text-black font-semibold text-sm hover:bg-luxe-goldHover transition-all shadow-xl shadow-luxe-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add {quantity} to Shopping Bag</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-2xl border transition-all ${
                    wishlisted
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
                      : 'bg-luxe-card border-luxe-border text-slate-300 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </motion.button>
              </div>
            </div>

          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-luxe-card border border-luxe-border text-[11px] text-luxe-muted">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="w-4 h-4 text-luxe-gold" />
              <span>Complimentary Express Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 border-x border-luxe-border px-2">
              <ShieldCheck className="w-4 h-4 text-luxe-gold" />
              <span>2-Year Global Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RotateCcw className="w-4 h-4 text-luxe-gold" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-8 pt-12 border-t border-luxe-border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-100">
              Verified Customer Reviews
            </h2>
            <p className="text-xs text-luxe-muted mt-1">Real feedback from authenticated owners</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {product.reviews?.length === 0 ? (
              <p className="text-sm text-luxe-muted py-8 text-center bg-luxe-card border border-luxe-border rounded-2xl">
                No reviews yet for this product. Be the first verified purchaser to leave feedback!
              </p>
            ) : (
              product.reviews?.map((rev: any) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-luxe-card border border-luxe-border space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={rev.user?.name}
                        className="w-8 h-8 rounded-full object-cover border border-luxe-gold/40"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-100">{rev.user?.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-medium">Verified Purchaser</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-luxe-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-luxe-gold' : 'text-luxe-border'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && <h5 className="font-semibold text-sm text-slate-100">{rev.title}</h5>}
                  <p className="text-xs text-luxe-muted leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Review Submission Form */}
          <div className="lg:col-span-5 bg-luxe-card border border-luxe-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 font-heading font-semibold text-slate-100">
              <MessageSquare className="w-4 h-4 text-luxe-gold" />
              <span>Write a Review</span>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-luxe-muted mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-luxe-gold text-luxe-gold' : 'text-luxe-border'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxe-muted mb-1">Headline Title</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional sound & build"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxe-muted mb-1">Your Review</label>
                <textarea
                  rows={3}
                  placeholder="Share details of your experience with this item..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-xl bg-luxe-gold text-black font-semibold text-xs hover:bg-luxe-goldHover transition-all shadow-md flex justify-center items-center"
              >
                {submittingReview ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Submit Verified Review</span>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-12 border-t border-luxe-border">
          <h2 className="font-heading font-bold text-2xl text-slate-100">
            You May Also Admire
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
