import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card/card';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  ThumbsUp,
  MessageCircle,
  Repeat,
  Send,
  MoreHorizontal,
  Heart,
  Share2,
  Bookmark,
  Trash2,
  Pencil,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import SmartCommentSuggestions from '../SmartCommentSuggestions/SmartCommentSuggestions';

// ─── Reusable Delete Confirmation Dialog ───────────────────────────────────────
const DeleteConfirmDialog = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div
      className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-150"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full border text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────

const Post = ({ item, personalData, onPostUpdated, defaultOpenComments = false, targetCommentId = null }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const activeUser = currentUser || personalData;

  const [seeMore, setSeeMore] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(defaultOpenComments);
  const [commentText, setCommentText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    if (!activeUser?.savedPosts) return false;
    return activeUser.savedPosts.some(id => id.toString() === item?._id?.toString() || (id._id && id._id.toString() === item?._id?.toString()));
  });

  // Edit Post modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDesc, setEditDesc] = useState(item?.desc || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [localDesc, setLocalDesc] = useState(item?.desc || '');

  // Delete confirmation states
  const [deleteCommentId, setDeleteCommentId] = useState(null);   // comment to confirm delete
  const [deletePostConfirm, setDeletePostConfirm] = useState(false); // post delete confirm
  const [deletingComment, setDeletingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  // Author details
  const author = item?.user || {};
  const authorName = author.f_name || 'LinkPro Member';
  const authorHeadline = author.headline || 'LinkPro Member';
  const authorAvatar =
    author.profilePic ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const imageLink = item?.imageLink;
  const description = localDesc;

  // Likes logic
  const [liked, setLiked] = useState(() => {
    if (!item?.likes || !activeUser?._id) return false;
    return item.likes.some((id) =>
      typeof id === 'object' ? id._id?.toString() === activeUser._id?.toString() : id.toString() === activeUser._id?.toString()
    );
  });

  const [noOfLikes, setNoOfLikes] = useState(() => {
    if (Array.isArray(item?.likes)) return item.likes.length;
    return 0;
  });

  const [sharesCount, setSharesCount] = useState(item?.shares || 0);

  // Mentions State & Response Handling
  const [mentions, setMentions] = useState(item?.mentions || []);
  const [mentionResponding, setMentionResponding] = useState(false);

  const myPendingMention = mentions.find(m => {
    const mUserId = m.user?._id ? m.user._id.toString() : m.user?.toString();
    const myId = activeUser?._id?.toString();
    return mUserId && myId && mUserId === myId && m.status === 'pending';
  });

  const handleMentionResponse = async (action) => {
    try {
      setMentionResponding(true);
      const res = await axios.put(
        `http://localhost:4000/api/post/${item._id}/mention/respond`,
        { action },
        { withCredentials: true }
      );
      toast.success(res.data?.message || 'Mention updated');
      setMentions(prev =>
        prev.map(m => {
          const mUserId = m.user?._id ? m.user._id.toString() : m.user?.toString();
          const myId = activeUser?._id?.toString();
          if (mUserId === myId) return { ...m, status: action };
          return m;
        })
      );
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update mention');
    } finally {
      setMentionResponding(false);
    }
  };

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(item?.comments || 0);
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);

  const commentRefs = useRef({});

  // Parse deep-linked comment ID from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const cId = targetCommentId || queryParams.get('commentId');
    if (cId) {
      setHighlightedCommentId(cId);
      setIsCommentOpen(true);
      fetchComments();
    }
  }, [location.search, targetCommentId]);

  // Scroll to deep-linked comment once comments are loaded
  useEffect(() => {
    if (highlightedCommentId && comments.length > 0) {
      const el = commentRefs.current[highlightedCommentId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedCommentId, comments]);

  const fetchComments = async () => {
    if (!item?._id) return;
    try {
      const resp = await axios.get(`http://localhost:4000/api/comment/${item._id}`);
      if (resp.data?.comments) {
        setComments(resp.data.comments);
        setCommentsCount(resp.data.comments.length);
      }
    } catch (err) {}
  };

  // Handle Like/Unlike Post
  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setNoOfLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    if (item?._id) {
      try {
        const res = await axios.post(
          'http://localhost:4000/api/post/likeDislike',
          { postId: item._id },
          { withCredentials: true }
        );
        if (typeof res.data?.likesCount === 'number') {
          setNoOfLikes(res.data.likesCount);
        }
      } catch (err) {}
    }
  };

  // Handle Comment Fetch & Open
  const toggleComments = async () => {
    const nextOpen = !isCommentOpen;
    setIsCommentOpen(nextOpen);

    if (nextOpen && item?._id) {
      await fetchComments();
    }
  };

  // Handle Comment Like Action
  const handleCommentLike = async (commentId) => {
    const selfId = activeUser?._id;
    if (!selfId) return;

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId) {
          const currentLikes = c.likes || [];
          const isLiked = currentLikes.some((id) =>
            typeof id === 'object' ? id._id?.toString() === selfId.toString() : id.toString() === selfId.toString()
          );
          const updatedLikes = isLiked
            ? currentLikes.filter((id) => (typeof id === 'object' ? id._id?.toString() !== selfId.toString() : id.toString() !== selfId.toString()))
            : [...currentLikes, selfId];

          return { ...c, likes: updatedLikes };
        }
        return c;
      })
    );

    try {
      await axios.post(
        'http://localhost:4000/api/comment/likeDislike',
        { commentId },
        { withCredentials: true }
      );
    } catch (err) {}
  };

  // Handle Send Comment
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Please enter a comment.');
      return;
    }

    const newCommentObj = {
      _id: 'temp-' + Date.now(),
      user: {
        _id: activeUser?._id || 'me',
        f_name: activeUser?.f_name || 'You',
        headline: activeUser?.headline || 'Member',
        profilePic:
          activeUser?.profilePic ||
          'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      },
      comment: commentText,
      likes: [],
      createdAt: new Date().toISOString(),
    };

    setComments([newCommentObj, ...comments]);
    setCommentsCount((prev) => prev + 1);
    const sentText = commentText;
    setCommentText('');

    if (item?._id) {
      try {
        const res = await axios.post(
          'http://localhost:4000/api/comment',
          { postId: item._id, comment: sentText },
          { withCredentials: true }
        );
        if (res.data?.comment) {
          setComments((prev) =>
            prev.map((c) => (c._id === newCommentObj._id ? res.data.comment : c))
          );
        }
        toast.success('Comment posted!');
      } catch (err) {
        toast.info('Comment posted!');
      }
    }
  };

  // ── Delete Comment (confirmed via styled dialog) ──────────────────────────
  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    try {
      setDeletingComment(true);
      // Optimistic removal
      setComments((prev) => prev.filter((c) => c._id !== deleteCommentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));

      await axios.delete(`http://localhost:4000/api/post/${item._id}/comments/${deleteCommentId}`, {
        withCredentials: true,
      });
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete comment');
      fetchComments(); // re-fetch if error
    } finally {
      setDeletingComment(false);
      setDeleteCommentId(null);
    }
  };


  const handleSavePost = async () => {
    try {
      setIsSaved(!isSaved);
      const res = await axios.post(`http://localhost:4000/api/post/save/${item._id}`, {}, { withCredentials: true });
      if (activeUser) {
          activeUser.savedPosts = res.data.savedPosts;
      }
      toast.success(res.data.message || (isSaved ? 'Removed from saved items' : 'Post saved!'));
    } catch (err) {
      setIsSaved(isSaved);
      toast.error('Failed to save post');
    }
  };

  // Share action with DB persistence & clipboard copy
  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);

    const authorId = author._id || activeUser?._id || 'me';
    const postUrl = `${window.location.origin}/profile/${authorId}/activities/${item?._id || 'post'}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success('Post link copied to clipboard!');
    } catch (e) {
      toast.success('Post link copied!');
    }

    if (item?._id) {
      try {
        const res = await axios.post(
          `http://localhost:4000/api/post/share/${item._id}`,
          {},
          { withCredentials: true }
        );
        if (typeof res.data?.shares === 'number') {
          setSharesCount(res.data.shares);
        }
      } catch (err) {}
    }
  };

  // Edit Post (Author Permission Enforced)
  const handleSaveEditPost = async () => {
    if (!editDesc.trim()) {
      return toast.error('Post content cannot be empty');
    }

    try {
      setSavingEdit(true);
      const res = await axios.put(
        `http://localhost:4000/api/post/${item._id}`,
        { desc: editDesc },
        { withCredentials: true }
      );
      setLocalDesc(editDesc);
      setEditModalOpen(false);
      toast.success('Post updated successfully');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update post');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete Post (confirmed via styled dialog) ──────────────────────────────
  const handleDeletePost = async () => {
    try {
      setDeletingPost(true);
      await axios.delete(`http://localhost:4000/api/post/${item._id}`, {
        withCredentials: true,
      });
      toast.success('Post deleted successfully');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete post');
    } finally {
      setDeletingPost(false);
      setDeletePostConfirm(false);
    }
  };

  const isAuthor =
    author._id?.toString() === activeUser?._id?.toString() ||
    (typeof author === 'string' && author === activeUser?._id?.toString()) ||
    activeUser?.role === 'admin';

  return (
    <Card padding={false} className="shadow-sm">

      {/* ── Delete Comment Confirmation Dialog ────────────────────────────────── */}
      {deleteCommentId && (
        <DeleteConfirmDialog
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          onConfirm={handleDeleteComment}
          onCancel={() => setDeleteCommentId(null)}
          loading={deletingComment}
        />
      )}

      {/* ── Delete Post Confirmation Dialog ───────────────────────────────────── */}
      {deletePostConfirm && (
        <DeleteConfirmDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? All comments and likes will be permanently removed."
          onConfirm={handleDeletePost}
          onCancel={() => setDeletePostConfirm(false)}
          loading={deletingPost}
        />
      )}

      {/* ── Pending Mention Approval Banner ─────────────────────────────────── */}
      {myPendingMention && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-blue-50/90 dark:bg-blue-900/25 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">📌</span>
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {authorName} mentioned you in this post.
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Accept to display this post on your profile's Tagged tab.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleMentionResponse('accepted')}
              disabled={mentionResponding}
              className="px-3 py-1 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-full font-semibold transition-colors cursor-pointer text-xs"
            >
              {mentionResponding ? 'Saving...' : 'Accept'}
            </button>
            <button
              onClick={() => handleMentionResponse('rejected')}
              disabled={mentionResponding}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full font-medium transition-colors cursor-pointer text-xs"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Activity Header if liked by a connection */}
      {item?.activityHeader && item.activityHeader.type === 'CONNECTION_LIKED' && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 text-xs text-gray-500 border-b border-[var(--border-color)]">
          <ThumbsUp size={13} className="text-[#0a66c2] fill-[#0a66c2]" />
          <span>
            <Link
              to={`/profile/${item.activityHeader.user?._id || 'me'}`}
              className="font-bold text-[var(--text-primary)] hover:text-[#0a66c2] hover:underline"
            >
              {item.activityHeader.user?.f_name || 'Your connection'}
            </Link>{' '}
            liked this
          </span>
        </div>
      )}

      {/* Top Header: Author info & options menu */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${author._id || 'me'}`} className="relative group">
            <div className="w-11 h-11 rounded-full p-0.5 ring-2 ring-sky-500/80 transition-transform group-hover:scale-105">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${author._id || 'me'}`}
                className="text-sm font-semibold hover:underline block leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {authorName}
              </Link>

              {/* Mentions list display */}
              {mentions && mentions.filter(m => m.status === 'accepted' || (isAuthor && m.user)).length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-wrap">
                  <span>with</span>
                  {mentions
                    .filter(m => m.status === 'accepted' || (isAuthor && m.user))
                    .map((m, idx, arr) => (
                      <React.Fragment key={m.user?._id || idx}>
                        <Link
                          to={`/profile/${m.user?._id || 'me'}`}
                          className="font-semibold text-[#0a66c2] dark:text-sky-400 hover:underline"
                        >
                          @{m.user?.f_name || 'Friend'}
                        </Link>
                        {m.status === 'pending' && isAuthor && (
                          <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-full">
                            (pending)
                          </span>
                        )}
                        {idx < arr.length - 1 && <span>,</span>}
                      </React.Fragment>
                    ))}
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-0.5 font-normal">
              {authorHeadline}
              {item?.createdAt && (
                <span className="ml-1.5 text-gray-400">
                  • {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-7 w-44 rounded-xl p-1.5 shadow-2xl border z-20 backdrop-blur-lg"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <button
                onClick={() => { handleSavePost(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <Bookmark size={14} className={isSaved ? 'text-sky-500 fill-sky-500' : ''} />
                <span>{isSaved ? 'Unsave Post' : 'Save Post'}</span>
              </button>
              <button
                onClick={() => {
                  handleShare();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <Share2 size={14} />
                <span>Copy link to post</span>
              </button>

              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditDesc(description);
                      setEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Pencil size={14} />
                    <span>Edit Post</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeletePostConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Delete Post</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content / Caption */}
      {description && (
        <div className="px-5 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-secondary)' }}>
          {seeMore ? (
            <span>
              {description}
              <button
                onClick={() => setSeeMore(false)}
                className="text-[#0a66c2] font-bold ml-1 cursor-pointer hover:underline uppercase tracking-wide"
              >
                READ LESS
              </button>
            </span>
          ) : (
            <span>
              {description.length > 200 ? `${description.slice(0, 200)}..... ` : description}
              {description.length > 200 && (
                <button
                  onClick={() => setSeeMore(true)}
                  className="text-[#0a66c2] font-bold ml-1 cursor-pointer hover:underline uppercase tracking-wide"
                >
                  READ MORE
                </button>
              )}
            </span>
          )}
        </div>
      )}

      {/* Post Media Attachment */}
      {imageLink && (
        <div className="mt-2 w-full overflow-hidden bg-black/5 dark:bg-black/20 flex justify-center">
          <img
            src={imageLink}
            alt="Post media"
            className="w-full max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
      )}

      {/* Reactions Count Row (Likes, Comments, Shares) */}
      <div
        className="flex items-center justify-between px-5 py-2.5 text-xs text-gray-500 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <div className="w-5 h-5 rounded-full bg-[#0a66c2] flex items-center justify-center text-white ring-2 ring-[var(--bg-card)]">
              <ThumbsUp size={10} className="fill-white" />
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white ring-2 ring-[var(--bg-card)]">
              <Heart size={10} className="fill-white" />
            </div>
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-300 pl-1">{noOfLikes}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={toggleComments}
            className="hover:underline cursor-pointer text-gray-500"
          >
            {commentsCount} comments
          </button>
          <span>•</span>
          <span className="text-gray-500">{sharesCount} shares</span>
        </div>
      </div>

      {/* Action Buttons Row: Like, Comment, Share */}
      <div className="flex items-center justify-between px-3 py-1">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${
            liked ? 'text-[#0a66c2]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <ThumbsUp size={16} className={liked ? 'fill-[#0a66c2] text-[#0a66c2]' : ''} />
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <MessageCircle size={16} />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      {/* Inline Comments Section Drawer */}
      {isCommentOpen && (
        <div
          className="px-5 pt-3 pb-4 border-t space-y-3 animate-in fade-in duration-200"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <SmartCommentSuggestions postId={item?._id} postContent={item?.desc || ''} onSelectSuggestion={(text) => setCommentText(text)} />
          {/* Add comment input */}
          <form onSubmit={handleSendComment} className="flex items-center gap-3">
            <img
              src={
                activeUser?.profilePic ||
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-400/40"
            />
            <div
              className="flex-1 flex items-center rounded-full border px-3 py-1.5"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-color)',
              }}
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-gray-500"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                className="text-xs bg-[#0a66c2] hover:bg-[#004182] text-white px-3.5 py-1 rounded-full font-medium cursor-pointer ml-1 transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {comments.length > 0 ? (
              comments.map((c, i) => {
                const isTargetComment = highlightedCommentId === c._id;
                const commentAuthorId = c.user?._id?.toString() || (typeof c.user === 'string' ? c.user : null);
                const isCommentAuthor =
                  commentAuthorId === activeUser?._id?.toString() || activeUser?.role === 'admin';

                const isCommentLiked =
                  Array.isArray(c.likes) &&
                  activeUser?._id &&
                  c.likes.some((id) =>
                    typeof id === 'object' ? id._id?.toString() === activeUser._id?.toString() : id.toString() === activeUser._id?.toString()
                  );
                const commentLikesCount = Array.isArray(c.likes) ? c.likes.length : 0;

                return (
                  <div
                    key={c._id || i}
                    ref={(el) => {
                      if (c._id) commentRefs.current[c._id] = el;
                    }}
                    className={`flex gap-2.5 text-xs transition-all duration-500 rounded-2xl p-1.5 ${
                      isTargetComment
                        ? 'ring-2 ring-[#0a66c2] bg-blue-500/10 shadow-lg scale-[1.01]'
                        : ''
                    }`}
                  >
                    <img
                      src={
                        c.user?.profilePic ||
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                      }
                      alt={c.user?.f_name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div
                      className="flex-1 p-2.5 rounded-2xl relative group"
                      style={{ backgroundColor: 'var(--bg-input)' }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            {c.user?.f_name || 'Member'}
                          </span>
                          <div className="text-[11px] text-gray-500">{c.user?.headline || 'Member'}</div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-gray-400">
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Recent'}
                          </span>

                          {/* Delete Comment Button — styled confirm dialog */}
                          {isCommentAuthor && (
                            <button
                              onClick={() => setDeleteCommentId(c._id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 text-gray-800 dark:text-gray-200 leading-relaxed">{c.comment}</div>

                      {/* Comment Action Footer: Like Comment + Count */}
                      <div className="flex items-center gap-3 mt-2 pt-1 border-t border-gray-400/20 text-[11px]">
                        <button
                          onClick={() => handleCommentLike(c._id)}
                          className={`flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                            isCommentLiked ? 'text-[#0a66c2]' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                          }`}
                        >
                          <ThumbsUp size={12} className={isCommentLiked ? 'fill-[#0a66c2]' : ''} />
                          <span>Like</span>
                        </button>

                        {commentLikesCount > 0 && (
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>{commentLikesCount} {commentLikesCount === 1 ? 'like' : 'likes'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-2 text-xs text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Edit Post
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4">
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={5}
                placeholder="What do you want to talk about?"
                className="w-full p-3.5 rounded-xl border text-sm outline-none resize-none focus:ring-2 focus:ring-[#0a66c2]/30"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-full border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditPost}
                disabled={savingEdit}
                className="px-5 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Post;
