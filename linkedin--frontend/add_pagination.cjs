const fs = require('fs');
let content = fs.readFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--frontend/src/pages/Profile/Profile.jsx', 'utf8');

// Add State
content = content.replace('const [savedPosts, setSavedPosts] = useState([]);', 'const [savedPosts, setSavedPosts] = useState([]);\n    const [savedPostsPage, setSavedPostsPage] = useState(0);\n    const savedPostsPerPage = 2;');

// The new Saved Posts Block
const oldSavedPostsSection = `                    {/* Saved Posts Section */}
                    {userData?._id === ownData?._id && savedPosts?.length > 0 && (
                        <div className='mt-5'>
                            <Card padding={1}>
                                <div className='flex justify-between items-center mb-4'>
                                    <div className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>Saved Posts</div>
                                    <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0a66c2]'>
                                        {savedPosts.length} {savedPosts.length === 1 ? 'Post' : 'Posts'}
                                    </span>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {savedPosts.map((post) => (
                                        <div 
                                            key={post._id} 
                                            className='block border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-black/5 dark:bg-white/5'
                                            style={{ borderColor: 'var(--border-color)' }}
                                            onClick={() => { window.location.href = \`/profile/\${post.user?._id}/activities/\${post._id}\`; }}
                                        >
                                            {post.imageLink && (
                                                <div className='w-full h-24 overflow-hidden'>
                                                    <img src={post.imageLink} alt='Post Media' className='w-full h-full object-cover' />
                                                </div>
                                            )}
                                            <div className='p-3 flex flex-col gap-1.5'>
                                                <div className='flex items-center gap-2'>
                                                    <img src={post.user?.profilePic || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'} alt='Author' className='w-6 h-6 rounded-full object-cover' />
                                                    <span className='text-xs font-bold truncate' style={{ color: 'var(--text-primary)' }}>{post.user?.f_name || 'LinkPro Member'}</span>
                                                </div>
                                                <p className='text-xs text-gray-500 line-clamp-2'>
                                                    {post.desc || 'Media post'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}`;

const newSavedPostsSection = `                    {/* Saved Posts Section */}
                    {userData?._id === ownData?._id && savedPosts?.length > 0 && (
                        <div className='mt-5'>
                            <Card padding={1}>
                                <div className='flex justify-between items-center mb-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>Saved Posts</div>
                                        <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0a66c2]'>
                                            {savedPosts.length} {savedPosts.length === 1 ? 'Post' : 'Posts'}
                                        </span>
                                    </div>
                                    
                                    {/* Pagination Controls */}
                                    {savedPosts.length > savedPostsPerPage && (
                                        <div className='flex items-center gap-2'>
                                            <button 
                                                onClick={() => setSavedPostsPage(prev => Math.max(0, prev - 1))}
                                                disabled={savedPostsPage === 0}
                                                className='p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200 flex items-center justify-center cursor-pointer'
                                                title="Previous Posts"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setSavedPostsPage(prev => Math.min(Math.ceil(savedPosts.length / savedPostsPerPage) - 1, prev + 1))}
                                                disabled={savedPostsPage >= Math.ceil(savedPosts.length / savedPostsPerPage) - 1}
                                                className='p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200 flex items-center justify-center cursor-pointer'
                                                title="Next Posts"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {savedPosts.slice(savedPostsPage * savedPostsPerPage, (savedPostsPage + 1) * savedPostsPerPage).map((post) => (
                                        <div 
                                            key={post._id} 
                                            className='block border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-black/5 dark:bg-white/5'
                                            style={{ borderColor: 'var(--border-color)' }}
                                            onClick={() => { window.location.href = \`/profile/\${post.user?._id}/activities/\${post._id}\`; }}
                                        >
                                            {post.imageLink && (
                                                <div className='w-full h-24 overflow-hidden'>
                                                    <img src={post.imageLink} alt='Post Media' className='w-full h-full object-cover' />
                                                </div>
                                            )}
                                            <div className='p-3 flex flex-col gap-1.5'>
                                                <div className='flex items-center gap-2'>
                                                    <img src={post.user?.profilePic || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'} alt='Author' className='w-6 h-6 rounded-full object-cover' />
                                                    <span className='text-xs font-bold truncate' style={{ color: 'var(--text-primary)' }}>{post.user?.f_name || 'LinkPro Member'}</span>
                                                </div>
                                                <p className='text-xs text-gray-500 line-clamp-2'>
                                                    {post.desc || 'Media post'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}`;

content = content.replace(oldSavedPostsSection, newSavedPostsSection);
fs.writeFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--frontend/src/pages/Profile/Profile.jsx', content);
