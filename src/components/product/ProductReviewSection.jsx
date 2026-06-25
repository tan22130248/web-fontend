import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Star, MessageSquare, ChevronDown, CheckCircle, HelpCircle, MessageCircle, Edit, Trash2, Send, X } from 'lucide-react';
import reviewService from '../../services/reviewService';

const formatPrice = (val) => {
  if (val == null) return '0đ';
  return Number(val).toLocaleString('vi-VN') + 'đ';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ProductReviewSection({ productId }) {
  const { user, isAuthenticated, getAuthHeader } = useAuth();
  
  const [activeSection, setActiveSection] = useState('reviews');

  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    hasPurchased: false,
    hasRated: false
  });

  const [reviews, setReviews] = useState([]);
  const [reviewRatingFilter, setReviewRatingFilter] = useState(null); // null = all
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentBuyerFilter, setCommentBuyerFilter] = useState(false);
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('review'); // 'review' or 'comment'
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply states for both reviews and comments
  const [replyingToReview, setReplyingToReview] = useState(null);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await reviewService.getSummary(productId);
      setSummary(res);
      if (res.hasRated) {
        setFormType('comment');
      } else if (res.hasPurchased) {
        setFormType('review');
      } else {
        setFormType('comment');
      }
    } catch (err) {
      console.error('Error fetching review summary', err);
    }
  };

  const fetchReviews = async (ratingFilter = reviewRatingFilter, page = reviewPage) => {
    try {
      const headers = getAuthHeader();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/reviews?rating=${ratingFilter || ''}&page=${page}&size=5`,
        { headers }
      );

      if (response.ok) {
        const res = await response.json();
        setReviews(res.content || []);
        setReviewTotalPages(res.totalPages || 0);
      } else {
        console.error('Error fetching reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews', err);
    }
  };

  const fetchComments = async (buyerOnly = commentBuyerFilter, page = commentPage) => {
    try {
      const headers = getAuthHeader();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/comments?buyerOnly=${buyerOnly}&page=${page}&size=5`,
        { headers }
      );

      if (response.ok) {
        const res = await response.json();
        setComments(res.content || []);
        setCommentTotalPages(res.totalPages || 0);
      } else {
        console.error('Error fetching comments');
      }
    } catch (err) {
      console.error('Error fetching comments', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [productId, isAuthenticated]);

  useEffect(() => {
    fetchReviews(reviewRatingFilter, reviewPage);
  }, [productId, reviewRatingFilter, reviewPage]);

  useEffect(() => {
    fetchComments(commentBuyerFilter, commentPage);
  }, [productId, commentBuyerFilter, commentPage]);

  // Handle Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createReview(productId, rating, commentText);
      toast.success('Đăng đánh giá thành công!');
      setCommentText('');
      setShowForm(false);
      fetchSummary();
      setReviewPage(0);
      fetchReviews(reviewRatingFilter, 0);
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      toast.warning('Vui lòng nhập câu hỏi hoặc bình luận');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createComment(productId, commentContent);
      toast.success('Đăng bình luận thành công!');
      setCommentContent('');
      setShowForm(false);
      fetchSummary();
      setCommentPage(0);
      fetchComments(commentBuyerFilter, 0);
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để viết đánh giá hoặc bình luận');
      return;
    }
    setShowForm(!showForm);
  };

  // Reply functions for Comments
  const handleCommentReplySubmit = async (commentId) => {
    if (!replyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/comments/${commentId}/reply`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: replyContent })
        }
      );

      if (response.ok) {
        const replyData = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), replyData],
                  canReply: false
                }
              : comment
          )
        );
        setReplyContent('');
        setReplyingToComment(null);
        toast.success('Đã gửi phản hồi thành công');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể gửi phản hồi');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Có lỗi xảy ra khi gửi phản hồi');
    }
    setSubmittingReply(false);
  };

  // Reply functions for Reviews  
  const handleReviewReplySubmit = async (reviewId) => {
    if (!replyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/reviews/${reviewId}/reply`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: replyContent })
        }
      );

      if (response.ok) {
        const replyData = await response.json();
        setReviews(prev => 
          prev.map(review => 
            review.id === reviewId 
              ? {
                  ...review,
                  replies: [...(review.replies || []), replyData],
                  canReply: false
                }
              : review
          )
        );
        setReplyContent('');
        setReplyingToReview(null);
        toast.success('Đã gửi phản hồi thành công');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể gửi phản hồi');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Có lỗi xảy ra khi gửi phản hồi');
    }
    setSubmittingReply(false);
  };

  const handleReplyUpdate = async (replyId, isReview = false) => {
    if (!editReplyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };

      const endpoint = isReview 
        ? `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/reviews/0/reply/${replyId}`
        : `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/comments/0/reply/${replyId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ content: editReplyContent })
      });

      if (response.ok) {
        const updatedReply = await response.json();
        
        if (isReview) {
          setReviews(prev => 
            prev.map(review => ({
              ...review,
              replies: review.replies?.map(reply => 
                reply.id === replyId ? updatedReply : reply
              ) || []
            }))
          );
        } else {
          setComments(prev => 
            prev.map(comment => ({
              ...comment,
              replies: comment.replies?.map(reply => 
                reply.id === replyId ? updatedReply : reply
              ) || []
            }))
          );
        }
        
        setEditingReplyId(null);
        setEditReplyContent('');
        toast.success('Đã cập nhật phản hồi thành công');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể cập nhật phản hồi');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Có lỗi xảy ra khi cập nhật phản hồi');
    }
    setSubmittingReply(false);
  };

  const handleReplyDelete = async (replyId, isReview = false) => {
    if (!window.confirm('Bạn có chắc muốn xóa phản hồi này?')) return;

    try {
      const headers = getAuthHeader();

      const endpoint = isReview
        ? `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/reviews/0/reply/${replyId}`
        : `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/comments/0/reply/${replyId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        if (isReview) {
          setReviews(prev => 
            prev.map(review => ({
              ...review,
              replies: review.replies?.filter(reply => reply.id !== replyId) || [],
              canReply: user && user.role === 'seller'
            }))
          );
        } else {
          setComments(prev => 
            prev.map(comment => ({
              ...comment,
              replies: comment.replies?.filter(reply => reply.id !== replyId) || [],
              canReply: user && user.role === 'seller'
            }))
          );
        }
        
        toast.success('Đã xóa phản hồi thành công');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể xóa phản hồi');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Có lỗi xảy ra khi xóa phản hồi');
    }
  };

  const startReplyReview = (reviewId) => {
    setReplyingToReview(reviewId);
    setReplyingToComment(null);
    setReplyContent('');
  };

  const startReplyComment = (commentId) => {
    setReplyingToComment(commentId);
    setReplyingToReview(null);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingToReview(null);
    setReplyingToComment(null);
    setReplyContent('');
  };

  const startEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyContent('');
  };

  // Delete comment handler
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này không? Hành động này không thể hoàn tác.')) return;

    try {
      const headers = getAuthHeader();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/products/${productId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers
        }
      );

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast.success('Đã xóa bình luận thành công');
        // Refresh comments to ensure data consistency
        fetchComments(commentBuyerFilter, commentPage);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể xóa bình luận');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Có lỗi xảy ra khi xóa bình luận');
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-[#F0ECE0] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#4A3B32]">Đánh giá & Bình luận</h2>
          <p className="text-xs text-gray-500 mt-0.5">Chia sẻ cảm nhận của bạn về sản phẩm</p>
        </div>
        <button
          onClick={handleOpenForm}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border flex items-center shadow-sm ${
            showForm 
              ? 'bg-gray-100 text-[#4A3B32] border-[#EBE7D9]' 
              : 'bg-[#A14A24] text-white border-[#A14A24] hover:bg-[#883d1c]'
          }`}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {showForm ? 'Đóng form viết' : 'Viết đánh giá / bình luận'}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#FAF8F2] p-5 rounded-2xl border border-[#EBE7D9] space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#EBE7D9]/80 pb-3">
            <span className="text-sm font-bold text-[#4A3B32]">Nội dung gửi:</span>
            
            <div className="flex space-x-1 bg-white p-1 rounded-xl border border-[#EBE7D9]">
              {summary.hasPurchased && !summary.hasRated && (
                <button
                  type="button"
                  onClick={() => setFormType('review')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    formType === 'review' 
                      ? 'bg-[#A14A24] text-white' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Đánh giá sao
                </button>
              )}
              <button
                type="button"
                onClick={() => setFormType('comment')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  formType === 'comment' 
                    ? 'bg-[#A14A24] text-white' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Hỏi đáp & Bình luận
              </button>
            </div>
          </div>

          {formType === 'review' ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">Số sao đánh giá:</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-amber-600 ml-2">
                    {rating === 5 && 'Rất tốt ⭐⭐⭐⭐⭐'}
                    {rating === 4 && 'Tốt ⭐⭐⭐⭐'}
                    {rating === 3 && 'Bình thường ⭐⭐⭐'}
                    {rating === 2 && 'Chưa tốt ⭐⭐'}
                    {rating === 1 && 'Rất tệ ⭐'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1">Nội dung đánh giá:</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Hãy chia sẻ trải nghiệm thực tế về sản phẩm này (kích cỡ, chất liệu, form dáng...)"
                  rows={4}
                  className="w-full text-sm p-3 rounded-xl border border-[#EBE7D9] focus:outline-none focus:ring-1 focus:ring-[#A14A24] bg-white text-[#4A3B32]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#A14A24] hover:bg-[#883d1c] disabled:bg-gray-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                  Đặt câu hỏi hoặc bình luận về sản phẩm:
                </label>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Bạn muốn hỏi về kích cỡ, ship hàng hay thương lượng thêm? Hãy viết tại đây..."
                  rows={4}
                  className="w-full text-sm p-3 rounded-xl border border-[#EBE7D9] focus:outline-none focus:ring-1 focus:ring-[#A14A24] bg-white text-[#4A3B32]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {summary.hasPurchased 
                    ? '✓ Bạn sẽ đăng bình luận với huy hiệu "Đã mua".' 
                    : 'ℹ Bạn sẽ đăng bình luận dưới tư cách "Người xem" (Chưa mua sản phẩm này).'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#A14A24] hover:bg-[#883d1c] disabled:bg-gray-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {summary.totalReviews > 0 && (
        <div className="bg-[#FCFBF4] p-5 rounded-2xl border border-[#EBE7D9] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 text-center border-r-0 md:border-r border-[#EBE7D9] pr-0 md:pr-6 space-y-1">
            <span className="text-4xl font-extrabold text-[#4A3B32]">{summary.averageRating.toFixed(1)}</span>
            <div className="flex justify-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(summary.averageRating) ? 'fill-current' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium">({summary.totalReviews} đánh giá sao)</p>
          </div>

          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.ratingDistribution[star] || 0;
              const percent = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center text-xs text-gray-600">
                  <span className="w-12 shrink-0 font-medium">{star} sao</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full mx-3 overflow-hidden">
                    <div 
                      className="bg-[#A14A24] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex border-b border-[#F0ECE0]">
        <button
          onClick={() => setActiveSection('reviews')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all ${
            activeSection === 'reviews'
              ? 'border-[#A14A24] text-[#A14A24]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Đánh giá của người mua ({summary.totalReviews})
        </button>
        <button
          onClick={() => setActiveSection('comments')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all ${
            activeSection === 'comments'
              ? 'border-[#A14A24] text-[#A14A24]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Hỏi đáp & Bình luận
        </button>
      </div>

      {activeSection === 'reviews' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 mr-2">Lọc số sao:</span>
            <button
              onClick={() => { setReviewRatingFilter(null); setReviewPage(0); }}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                reviewRatingFilter === null
                  ? 'bg-[#FAF8F2] border-[#A14A24] text-[#A14A24] font-bold'
                  : 'bg-white border-[#EBE7D9] text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tất cả ({summary.totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = summary.ratingDistribution[s] || 0;
              return (
                <button
                  key={s}
                  onClick={() => { setReviewRatingFilter(s); setReviewPage(0); }}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all flex items-center space-x-1 ${
                    reviewRatingFilter === s
                      ? 'bg-[#FAF8F2] border-[#A14A24] text-[#A14A24] font-bold'
                      : 'bg-white border-[#EBE7D9] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{s}★</span>
                  <span className="text-[10px] text-gray-400">({count})</span>
                </button>
              );
            })}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#EBE7D9] rounded-2xl bg-gray-50">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm text-gray-400">Chưa có đánh giá nào thỏa mãn tiêu chí lọc.</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-[#F0ECE0]">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0">
                  {/* Original Review */}
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={rev.userAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                      alt={rev.userName || 'User'}
                      className="w-10 h-10 rounded-full border border-[#EBE7D9] object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#4A3B32]">{rev.userName || 'Khách hàng'}</span>
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5 mr-0.5" />
                              Đã mua
                            </span>
                          </div>
                          <div className="flex text-amber-400 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-current' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed font-medium bg-[#FCFBF4]/50 p-3 rounded-xl border border-[#F0ECE0]/30">
                        {rev.comment}
                      </p>
                    </div>
                  </div>

                  {/* Replies for Reviews */}
                  {rev.replies && rev.replies.length > 0 && (
                    <div className="mt-4 ml-14 space-y-3">
                      {rev.replies.map((reply) => (
                        <div key={reply.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border-l-4 border-[#A14A24]">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 flex-1">
                              <img 
                                src={reply.shopAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                                alt={reply.shopName}
                                className="w-8 h-8 rounded-full object-cover border-2 border-[#A14A24]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <h5 className="font-semibold text-xs text-[#A14A24]">{reply.shopName}</h5>
                                  <span className="px-2 py-0.5 text-[10px] bg-[#A14A24] text-white rounded-full font-bold">
                                    Shop Owner
                                  </span>
                                  <span className="text-[10px] text-gray-600">
                                    {formatDate(reply.createdAt)}
                                    {reply.updatedAt !== reply.createdAt && (
                                      <span className="ml-1 italic">(đã chỉnh sửa)</span>
                                    )}
                                  </span>
                                </div>
                                
                                {editingReplyId === reply.id ? (
                                  <div className="mt-2">
                                    <textarea
                                      value={editReplyContent}
                                      onChange={(e) => setEditReplyContent(e.target.value)}
                                      className="w-full px-3 py-2 border border-[#EBE7D9] rounded-lg resize-none focus:ring-2 focus:ring-[#A14A24] focus:border-transparent text-sm bg-white"
                                      rows="2"
                                      placeholder="Chỉnh sửa phản hồi..."
                                    />
                                    <div className="flex items-center justify-end space-x-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={cancelEditReply}
                                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleReplyUpdate(reply.id, true)}
                                        disabled={submittingReply}
                                        className="px-3 py-1 text-xs bg-[#A14A24] text-white rounded-lg hover:bg-[#883d1c] disabled:opacity-50 font-semibold"
                                      >
                                        {submittingReply ? 'Đang lưu...' : 'Lưu'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Edit/Delete buttons for shop owner */}
                            {user && user.role === 'seller' && reply.userId === user.id && editingReplyId !== reply.id && (
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => startEditReply(reply)}
                                  className="p-1.5 text-gray-500 hover:text-[#A14A24] hover:bg-white rounded transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReplyDelete(reply.id, true)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form for Reviews - Only show for shop owners of this product */}
                  {user && user.role === 'seller' && rev.canReply && (
                    <div className="mt-4 ml-14">
                      {replyingToReview !== rev.id ? (
                        <button
                          onClick={() => startReplyReview(rev.id)}
                          className="flex items-center space-x-2 text-[#A14A24] hover:text-[#883d1c] text-xs font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Trả lời đánh giá</span>
                        </button>
                      ) : (
                        <div className="space-y-3 bg-orange-50/30 p-3 rounded-xl border border-orange-100">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full px-3 py-2 border border-[#EBE7D9] rounded-lg resize-none focus:ring-2 focus:ring-[#A14A24] focus:border-transparent text-sm bg-white"
                            rows="3"
                            placeholder="Cảm ơn bạn đã đánh giá! Hãy trả lời khách hàng..."
                            required
                          />
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={cancelReply}
                              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 text-xs font-medium"
                            >
                              <X className="w-3 h-3" />
                              <span>Hủy</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewReplySubmit(rev.id)}
                              disabled={submittingReply || !replyContent.trim()}
                              className="flex items-center space-x-1 px-4 py-2 bg-[#A14A24] text-white rounded-lg hover:bg-[#883d1c] disabled:opacity-50 text-xs font-semibold shadow-sm"
                            >
                              <Send className="w-3 h-3" />
                              <span>{submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message for shop owner if already replied */}
                  {user && user.role === 'seller' && !rev.canReply && rev.replies && rev.replies.length > 0 && (
                    <div className="mt-4 ml-14">
                      <span className="text-xs text-gray-500 italic">
                        Bạn đã trả lời đánh giá này
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {reviewTotalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-4 border-t border-[#F0ECE0]">
              <button
                disabled={reviewPage === 0}
                onClick={() => setReviewPage(prev => prev - 1)}
                className="px-3 py-1 bg-white border border-[#EBE7D9] text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs text-gray-500 font-bold">
                Trang {reviewPage + 1} / {reviewTotalPages}
              </span>
              <button
                disabled={reviewPage === reviewTotalPages - 1}
                onClick={() => setReviewPage(prev => prev + 1)}
                className="px-3 py-1 bg-white border border-[#EBE7D9] text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-gray-500">Lọc bình luận:</span>
            <button
              onClick={() => { setCommentBuyerFilter(false); setCommentPage(0); }}
              className={`px-3 py-1 rounded-full border transition-all ${
                !commentBuyerFilter
                  ? 'bg-[#FAF8F2] border-[#A14A24] text-[#A14A24] font-bold'
                  : 'bg-white border-[#EBE7D9] text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => { setCommentBuyerFilter(true); setCommentPage(0); }}
              className={`px-3 py-1 rounded-full border transition-all ${
                commentBuyerFilter
                  ? 'bg-[#FAF8F2] border-[#A14A24] text-[#A14A24] font-bold'
                  : 'bg-white border-[#EBE7D9] text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chỉ người đã mua
            </button>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#EBE7D9] rounded-2xl bg-gray-50">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm text-gray-400">Chưa có bình luận hoặc câu hỏi nào.</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-[#F0ECE0]">
              {comments.map((comm) => (
                <div key={comm.id} className="pt-6 first:pt-0">
                  {/* Original Comment */}
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={comm.userAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                      alt={comm.userName || 'User'}
                      className="w-10 h-10 rounded-full border border-[#EBE7D9] object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#4A3B32]">{comm.userName || 'Người dùng'}</span>
                          
                          {comm.isBuyer ? (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                              <CheckCircle className="w-3 h-3 mr-0.5" />
                              Đã mua
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full">
                              <HelpCircle className="w-3 h-3 mr-0.5" />
                              Người xem
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-gray-400">{formatDate(comm.createdAt)}</span>
                          {/* Delete button - shown for admin, shop owner, or comment author */}
                          {comm.canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comm.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa bình luận"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed bg-[#FAF8F2]/30 p-3 rounded-xl border border-[#F0ECE0]/20">
                        {comm.content}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {comm.replies && comm.replies.length > 0 && (
                    <div className="mt-4 ml-14 space-y-3">
                      {comm.replies.map((reply) => (
                        <div key={reply.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border-l-4 border-blue-500">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 flex-1">
                              <img 
                                src={reply.shopAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                                alt={reply.shopName}
                                className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <h5 className="font-semibold text-xs text-blue-900">{reply.shopName}</h5>
                                  <span className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded-full font-bold">
                                    Shop Owner
                                  </span>
                                  <span className="text-[10px] text-gray-600">
                                    {formatDate(reply.createdAt)}
                                    {reply.updatedAt !== reply.createdAt && (
                                      <span className="ml-1 italic">(đã chỉnh sửa)</span>
                                    )}
                                  </span>
                                </div>
                                
                                {editingReplyId === reply.id ? (
                                  <div className="mt-2">
                                    <textarea
                                      value={editReplyContent}
                                      onChange={(e) => setEditReplyContent(e.target.value)}
                                      className="w-full px-3 py-2 border border-[#EBE7D9] rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                      rows="2"
                                      placeholder="Chỉnh sửa phản hồi..."
                                    />
                                    <div className="flex items-center justify-end space-x-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={cancelEditReply}
                                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleReplyUpdate(reply.id, false)}
                                        disabled={submittingReply}
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                                      >
                                        {submittingReply ? 'Đang lưu...' : 'Lưu'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Edit/Delete buttons for shop owner */}
                            {user && user.role === 'seller' && reply.userId === user.id && editingReplyId !== reply.id && (
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => startEditReply(reply)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReplyDelete(reply.id, false)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form - Only show for shop owners of this product */}
                  {user && user.role === 'seller' && comm.canReply && (
                    <div className="mt-4 ml-14">
                      {replyingToComment !== comm.id ? (
                        <button
                          onClick={() => startReplyComment(comm.id)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Trả lời bình luận</span>
                        </button>
                      ) : (
                        <div className="space-y-3 bg-blue-50/30 p-3 rounded-xl border border-blue-100">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full px-3 py-2 border border-[#EBE7D9] rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                            rows="3"
                            placeholder="Trả lời bình luận của khách hàng..."
                            required
                          />
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={cancelReply}
                              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 text-xs font-medium"
                            >
                              <X className="w-3 h-3" />
                              <span>Hủy</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommentReplySubmit(comm.id)}
                              disabled={submittingReply || !replyContent.trim()}
                              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold shadow-sm"
                            >
                              <Send className="w-3 h-3" />
                              <span>{submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message for shop owner if already replied */}
                  {user && user.role === 'seller' && !comm.canReply && comm.replies && comm.replies.length > 0 && (
                    <div className="mt-4 ml-14">
                      <span className="text-xs text-gray-500 italic">
                        Bạn đã trả lời bình luận này
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {commentTotalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-4 border-t border-[#F0ECE0]">
              <button
                disabled={commentPage === 0}
                onClick={() => setCommentPage(prev => prev - 1)}
                className="px-3 py-1 bg-white border border-[#EBE7D9] text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs text-gray-500 font-bold">
                Trang {commentPage + 1} / {commentTotalPages}
              </span>
              <button
                disabled={commentPage === commentTotalPages - 1}
                onClick={() => setCommentPage(prev => prev + 1)}
                className="px-3 py-1 bg-white border border-[#EBE7D9] text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
