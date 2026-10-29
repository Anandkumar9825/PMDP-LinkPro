import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Components
import Card from '../../components/Card/card';
import ProfileCard from '../../components/ProfileCard/profileCard';
import GroupsWidget from '../../components/GroupsWidget/groupsWidget';
import HashtagsWidget from '../../components/HashtagsWidget/hashtagsWidget';
import AddToFeed from '../../components/AddToFeed/addToFeed';
import TopCourses from '../../components/TopCourses/topCourses';
import Footer from '../../components/Footer/footer';
import Post from '../../components/Post/post';
import Modal from '../../components/Modal/modal';
import AddModal from '../../components/AddModal/addModal';
import GoogleAvatarModal from '../../components/GoogleAvatarModal/googleAvatarModal';

// Icons
import {
  PenLine,
  Image as ImageIcon,
  Video,
  Calendar,
  Newspaper,
  ChevronDown,
  Sparkles,
  Clock,
  TrendingUp,
  PlusCircle,
  Users,
  UserCheck,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smile
} from 'lucide-react';

const Feeds = () => {
  const [personalData, setPersonalData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [addPostModal, setAddPostModal] = useState(false);
  const [postModalType, setPostModalType] = useState('text');
  const [sortBy, setSortBy] = useState('Recent');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('');

  // Google Avatar Onboarding Modal
  const [googleAvatarModalOpen, setGoogleAvatarModalOpen] = useState(false);
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState(null);

  const fetchData = async () => {
    setLoadingPosts(true);
    try {
      const [userDataRes, postDataRes] = await Promise.allSettled([
        axios.get('http://localhost:4000/api/auth/self', { withCredentials: true }),
        axios.get('http://localhost:4000/api/post/getAllPost', { withCredentials: true }),
      ]);

      if (userDataRes.status === 'fulfilled' && userDataRes.value?.data?.user) {
        setPersonalData(userDataRes.value.data.user);
        localStorage.setItem('userInfo', JSON.stringify(userDataRes.value.data.user));
      } else {
        const local = localStorage.getItem('userInfo');
        if (local) {
          try {
            setPersonalData(JSON.parse(local));
          } catch (e) {}
        }
      }

      if (
        postDataRes.status === 'fulfilled' &&
        Array.isArray(postDataRes.value?.data?.posts)
      ) {
        setPosts(postDataRes.value.data.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if there's a pending Google OAuth Avatar setup
    const pendingGoogle = sessionStorage.getItem('pendingGoogleAvatar');
    if (pendingGoogle) {
      setGoogleAvatarUrl(pendingGoogle);
      setGoogleAvatarModalOpen(true);
      sessionStorage.removeItem('pendingGoogleAvatar');
    }
  }, []);

  const handleOpenModal = (type = 'text') => {
    setPostModalType(type);
    setAddPostModal(true);
  };

  const handleNewPostCreated = (newPost) => {
    setPosts((previousPosts) => {
      const withoutDuplicate = previousPosts.filter((post) => post._id !== newPost._id);
      return [newPost, ...withoutDuplicate];
    });
  };

  // Sorting
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'Recent') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === 'Popular') {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    }
    return (b.likes?.length || 0) + (b.comments || 0) - ((a.likes?.length || 0) + (a.comments || 0));
  });

  // Filter posts if a hashtag is active
  const displayedPosts = activeTag
    ? sortedPosts.filter(
        (p) =>
          p.desc?.toLowerCase().includes(activeTag.toLowerCase()) ||
          p.tags?.includes(activeTag)
      )
    : sortedPosts;

  return (
    <main className="min-h-screen px-3 sm:px-6 lg:px-12 xl:px-20 py-5 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-[1380px] flex flex-col md:flex-row gap-5 items-start">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-full md:w-[28%] lg:w-[22%] flex-shrink-0 flex flex-col gap-4">
          <ProfileCard data={personalData} />
          <GroupsWidget />
          <HashtagsWidget onSelectTag={setActiveTag} activeTag={activeTag} />
        </aside>

        {/* ================= MIDDLE MAIN FEED ================= */}
        <section className="flex-1 w-full max-w-full md:max-w-2xl lg:max-w-[52%] flex flex-col gap-4">
          
          {/* Create Post Bar */}
          <Card padding={false} className="shadow-sm p-4">
            {/* Input Pill */}
            <div
              onClick={() => handleOpenModal('text')}
              className="flex items-center gap-3 px-4 py-3 rounded-full border cursor-pointer transition-all hover:border-sky-500/40"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-color)',
              }}
            >
              <PenLine size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 font-medium select-none">
                Start a post, share an insight...
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-4 pt-3 mt-2">
              <button
                onClick={() => handleOpenModal('photo')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[#0a66c2]">
                  <ImageIcon size={15} />
                </div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Photo</span>
              </button>

              <button
                onClick={() => handleOpenModal('video')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Video size={15} />
                </div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Video</span>
              </button>
            </div>
          </Card>

          {/* Sort bar */}
          <div className="flex items-center justify-between px-1 relative">
            <div className="flex-1 h-[1px]" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
              >
                <span>Sort by: <strong className="text-[var(--text-primary)]">{sortBy}</strong></span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div
                  className="absolute right-0 top-8 w-36 rounded-xl p-1.5 shadow-2xl border z-20 backdrop-blur-lg"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {['Top', 'Recent', 'Popular'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setIsSortOpen(false);
                        toast.info(`Feed sorted by ${opt}`);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl transition-colors text-left cursor-pointer ${
                        sortBy === opt
                          ? 'bg-[#0a66c2]/10 text-[#0a66c2] font-bold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {opt === 'Top' && <Sparkles size={13} />}
                      {opt === 'Recent' && <Clock size={13} />}
                      {opt === 'Popular' && <TrendingUp size={13} />}
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Tag Notice */}
          {activeTag && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/30 text-xs text-[#0a66c2]">
              <span>Showing posts tagged with <b>{activeTag}</b></span>
              <button
                onClick={() => setActiveTag('')}
                className="font-bold hover:underline cursor-pointer"
              >
                Clear filter ✕
              </button>
            </div>
          )}

          {/* Posts Feed List OR Modern Onboarding Welcome Section */}
          {loadingPosts ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]" />
            </div>
          ) : displayedPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {displayedPosts.map((postItem) => (
                <Post
                  key={postItem._id}
                  item={postItem}
                  personalData={personalData}
                  onPostUpdated={fetchData}
                />
              ))}
            </div>
          ) : (
            /* ================= 1. NEW USER ONBOARDING & WELCOME BANNER ================= */
            <div className="space-y-4">
              <Card padding={false} className="p-6 shadow-sm border overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      Welcome to LinkPro, {personalData?.f_name || 'Professional'}! 👋
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your feed shows updates from your direct connections and industry peers. Get started in 3 steps:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                  {/* Step 1: Complete Profile */}
                  <Link
                    to={`/profile/${personalData?._id || 'me'}`}
                    className="p-4 rounded-2xl border border-[var(--border-color)] hover:border-[#0a66c2] bg-[var(--bg-card)] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0a66c2] flex items-center justify-center mb-2.5">
                        <CheckCircle2 size={18} />
                      </div>
                      <h3 className="text-xs font-bold group-hover:text-[#0a66c2] transition-colors" style={{ color: 'var(--text-primary)' }}>
                        Complete Profile
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        Add a photo, headline, skills, and work history to stand out.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-[#0a66c2] flex items-center gap-1 mt-3">
                      <span>Edit profile</span>
                      <ArrowRight size={12} />
                    </span>
                  </Link>

                  {/* Step 2: Connect with Peers */}
                  <Link
                    to="/myNetwork"
                    className="p-4 rounded-2xl border border-[var(--border-color)] hover:border-[#0a66c2] bg-[var(--bg-card)] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2.5">
                        <Users size={18} />
                      </div>
                      <h3 className="text-xs font-bold group-hover:text-[#0a66c2] transition-colors" style={{ color: 'var(--text-primary)' }}>
                        Connect with Peers
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        Grow your network to unlock industry posts, insights, and opportunities.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-[#0a66c2] flex items-center gap-1 mt-3">
                      <span>Discover people</span>
                      <ArrowRight size={12} />
                    </span>
                  </Link>

                  {/* Step 3: Create First Post */}
                  <div
                    onClick={() => handleOpenModal('text')}
                    className="p-4 rounded-2xl border border-[var(--border-color)] hover:border-[#0a66c2] bg-[var(--bg-card)] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2.5">
                        <PenLine size={18} />
                      </div>
                      <h3 className="text-xs font-bold group-hover:text-[#0a66c2] transition-colors" style={{ color: 'var(--text-primary)' }}>
                        Share an Insight
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        Post an accomplishment, article, or project to inspire your peers.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-[#0a66c2] flex items-center gap-1 mt-3">
                      <span>Create post</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </section>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="hidden lg:flex w-[26%] flex-shrink-0 flex-col gap-4">
          <AddToFeed />
          <TopCourses />
          <Footer />
        </aside>

      </div>

      {/* Create Post Modal */}
      {addPostModal && (
        <Modal closeModal={() => setAddPostModal(false)} title="Create a post">
          <AddModal
            personalData={personalData}
            initialType={postModalType}
            closeModal={() => setAddPostModal(false)}
            onPostCreated={handleNewPostCreated}
          />
        </Modal>
      )}

      {/* Google Avatar Onboarding Modal */}
      {googleAvatarModalOpen && (
        <Modal closeModal={() => setGoogleAvatarModalOpen(false)} title="Profile Setup">
          <GoogleAvatarModal
            googlePicture={googleAvatarUrl}
            closeModal={() => setGoogleAvatarModalOpen(false)}
          />
        </Modal>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="light"
        hideProgressBar={false}
      />
    </main>
  );
};

export default Feeds;