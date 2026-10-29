import React, { useEffect, useState } from 'react'
import Advertisement from '../../components/Advertisement/advertisement'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card/card'
import axios from 'axios';
import { Bookmark, BookmarkX } from 'lucide-react';
import { toast } from 'react-toastify';

const AllSavedPosts = () => {

    const navigate = useNavigate();
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unsavingId, setUnsavingId] = useState(null);

    const fetchSavedPosts = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/post/saved/me', { withCredentials: true });
            setSavedPosts(res.data.posts?.filter(p => p != null) || []);
        } catch (err) {
            console.log('Error fetching saved posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (e, postId) => {
        e.stopPropagation();
        try {
            setUnsavingId(postId);
            setSavedPosts(prev => prev.filter(p => p._id !== postId));
            await axios.post(`http://localhost:4000/api/post/save/${postId}`, {}, { withCredentials: true });
            toast.success('Post removed from saved items');
        } catch (err) {
            toast.error('Failed to unsave post');
            fetchSavedPosts();
        } finally {
            setUnsavingId(null);
        }
    };

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    return (
        <div className='min-h-screen px-5 xl:px-50 py-8 flex gap-5 w-full mt-5 transition-colors duration-300'>

            {/* Middle */}
            <div className='w-full max-w-[680px] mx-auto'>
                <Card padding={1}>
                    <div className='flex items-center justify-between mb-5'>
                        <div className='flex items-center gap-3'>
                            <Bookmark size={20} className='text-[#0a66c2]' />
                            <div className='text-xl font-bold' style={{ color: 'var(--text-primary)' }}>Saved Posts</div>
                        </div>
                        <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0a66c2]'>
                            {savedPosts.length} {savedPosts.length === 1 ? 'Post' : 'Posts'}
                        </span>
                    </div>

                    {loading ? (
                        <div className='py-10 text-center text-sm text-gray-400'>Loading saved posts...</div>
                    ) : savedPosts.length > 0 ? (
                        /* ── Horizontal scroll carousel ── */
                        <div className='overflow-x-auto no-scrollbar pb-2'>
                            <div className='flex gap-4' style={{ width: 'max-content' }}>
                                {savedPosts.map((post) => (
                                    <div
                                        key={post._id}
                                        className='relative border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex-shrink-0 w-[240px]'
                                        style={{ borderColor: 'var(--border-color)' }}
                                        onClick={() => navigate(`/profile/${post.user?._id}/activities/${post._id}`)}
                                    >
                                        {/* Unsave button — top-right hover */}
                                        <button
                                            onClick={(e) => handleUnsave(e, post._id)}
                                            disabled={unsavingId === post._id}
                                            title="Unsave Post"
                                            className='absolute top-2 right-2 z-10 p-1.5 rounded-full
                                                       bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                                                       text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20
                                                       border border-red-200 dark:border-red-500/40
                                                       shadow-sm transition-all cursor-pointer
                                                       opacity-0 group-hover:opacity-100'
                                        >
                                            <BookmarkX size={14} />
                                        </button>

                                        {post.imageLink && (
                                            <div className='w-full h-32 overflow-hidden'>
                                                <img
                                                    src={post.imageLink}
                                                    alt='Post'
                                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                                                />
                                            </div>
                                        )}
                                        <div className='p-3 flex flex-col gap-2' style={{ backgroundColor: 'var(--bg-card)' }}>
                                            <div className='flex items-center gap-2'>
                                                <img
                                                    src={post.user?.profilePic || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
                                                    alt='Author'
                                                    className='w-6 h-6 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700 flex-shrink-0'
                                                />
                                                <div className='min-w-0'>
                                                    <div className='text-xs font-bold truncate' style={{ color: 'var(--text-primary)' }}>
                                                        {post.user?.f_name || 'LinkPro Member'}
                                                    </div>
                                                    <div className='text-[10px] text-gray-400 truncate'>{post.user?.headline || 'Professional'}</div>
                                                </div>
                                            </div>
                                            <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed'>
                                                {post.desc || 'Media post'}
                                            </p>
                                            {/* Mobile unsave pill */}
                                            <button
                                                onClick={(e) => handleUnsave(e, post._id)}
                                                disabled={unsavingId === post._id}
                                                className='md:hidden self-start flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                                                           text-red-500 bg-red-50 dark:bg-red-500/10
                                                           border border-red-200 dark:border-red-500/30 transition-all cursor-pointer mt-1'
                                            >
                                                <BookmarkX size={10} />
                                                <span>Unsave</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='py-16 flex flex-col items-center gap-3 text-center'>
                            <Bookmark size={36} className='text-gray-300 dark:text-gray-600' />
                            <p className='text-sm text-gray-400'>You haven&apos;t saved any posts yet.</p>
                            <p className='text-xs text-gray-400'>Use the 3-dot menu on any post to save it for later.</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Right Sidebar */}
            <div className='w-[26%] hidden md:block flex-shrink-0'>
                <div className='my-5 sticky top-19'>
                    <Advertisement />
                </div>
            </div>
        </div>
    )
}

export default AllSavedPosts
