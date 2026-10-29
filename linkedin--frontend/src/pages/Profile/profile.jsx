import React, { useState, useEffect, useRef } from 'react'
import Advertisement from '../../components/Advertisement/advertisement'
import Card from '../../components/Card/card'
import Post from '../../components/Post/post';
import Modal from '../../components/Modal/modal';
import ImageModal from '../../components/ImageModal/imageModal';
import EditInfoModal from '../../components/EditInfoModal/editInfoModal';
import AboutModal from '../../components/AboutModal/aboutModal';
import ExpModal from '../../components/ExpModal/expModal';
import MessageModal from '../../components/MessageModal/messageModal';
import DeleteAccountModal from '../../components/DeleteAccountModal/deleteAccountModal';
import ChangePasswordModal from '../../components/ChangePasswordModal/changePasswordModal';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';       // For User Id.

import EditIcon from '@mui/icons-material/Edit';        // Import Icons.
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Trash2, KeyRound, Lock, ShieldCheck, ChevronLeft, ChevronRight, BookmarkX } from 'lucide-react';

const Profile = () => {
    const { currentUser, updateCurrentUser, logout } = useAuth();

    // For User Id.
    const { id } = useParams();

    const cachedUser = (() => {
        try {
            const stored = localStorage.getItem('userInfo');
            return stored ? JSON.parse(stored) : currentUser;
        } catch (e) {
            return currentUser;
        }
    })();

    const isOwnProfile = id === 'me' || id === cachedUser?._id || id === currentUser?._id;

    // Change Password Modal
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    //  To Change Image.
    const [imageSetModal, setImageModal] = useState(false);
    const [circularImage, setCircularImage] = useState(true);

    // To Change User Details.
    const [infoModal, setInfoModal] = useState(false);

    // To Open Message Box.
    const [messageModal, setMessageModal] = useState(false);

    // To Change About Details.
    const [aboutModal, setAboutModal] = useState(false);

    // To Change Experience Details.
    const [expModal, setExpModal] = useState(false);
    const [updateExp, setUpdateExp] = useState({ clicked: false, id: '', data: {} });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null); // id of exp to confirm delete

    // To Open Delete Account Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [userData, setUserData] = useState(isOwnProfile ? (cachedUser || currentUser) : null);
    const [postData, setPostData] = useState([]);
    const [taggedPosts, setTaggedPosts] = useState([]);
    const [activeActivityTab, setActiveActivityTab] = useState('posts');
    const [ownData, setOwnData] = useState(cachedUser || currentUser);
    const [loading, setLoading] = useState(!isOwnProfile && !userData);
    const [savedPosts, setSavedPosts] = useState([]);
    const [savedPostsPage, setSavedPostsPage] = useState(0);
    const savedPostsPerPage = 2;

    const activitiesScrollRef = useRef(null);

    const scrollActivities = (direction) => {
        if (activitiesScrollRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            activitiesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const updateExpEdit = (id, data) => {
        setUpdateExp({
            clicked: true,
            id: id,
            data: data
        });
        setExpModal(true);
    };

    const handleDeleteExperience = async (expId) => {
        try {
            const res = await axios.delete(`http://localhost:4000/api/users/experience/${expId}`, { withCredentials: true });
            if (res.data?.user) {
                await updateCurrentUser(res.data.user);
                setUserData(prev => ({ ...prev, experience: res.data.user.experience }));
                setOwnData(prev => ({ ...prev, experience: res.data.user.experience }));
            } else {
                const updatedList = (ownData?.experience || []).filter(item => item._id !== expId);
                setUserData(prev => ({ ...prev, experience: updatedList }));
                setOwnData(prev => ({ ...prev, experience: updatedList }));
            }
            toast.success('Experience deleted successfully');
        } catch (err) {
            console.error('Delete experience error:', err);
            toast.error(err?.response?.data?.error || 'Failed to delete experience');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    useEffect(() => {
        fetchDataOnLoad();
    }, [id, currentUser?._id]);

    const fetchDataOnLoad = async () => {
        setLoading(true);
        try {
            // Always ensure self user is fresh
            let selfUser = currentUser || cachedUser;
            try {
                const selfRes = await axios.get('http://localhost:4000/api/auth/self', { withCredentials: true });
                if (selfRes.data?.user) {
                    selfUser = selfRes.data.user;
                    setOwnData(selfUser);
                    localStorage.setItem('userInfo', JSON.stringify(selfUser));
                }
            } catch (e) {}

            const resolvedTargetId = (id === 'me' || !id) ? selfUser?._id : id;

            if (!resolvedTargetId) {
                if (selfUser) setUserData(selfUser);
                setLoading(false);
                return;
            }

            const isSelf = resolvedTargetId === selfUser?._id || id === 'me';

            const [userDatas, postDatas, savedDatas, taggedDatas] = await Promise.all([
                axios.get(`http://localhost:4000/api/auth/user/${resolvedTargetId}`, { withCredentials: true })
                    .catch(() => ({ data: { user: isSelf ? selfUser : null } })),
                axios.get(`http://localhost:4000/api/post/getTop5Post/${resolvedTargetId}`, { withCredentials: true })
                    .catch(() => ({ data: { posts: [] } })),
                (isSelf 
                    ? axios.get('http://localhost:4000/api/post/saved/me', { withCredentials: true }).catch(() => ({ data: { posts: [] } }))
                    : Promise.resolve({ data: { posts: [] } })),
                axios.get(`http://localhost:4000/api/post/tagged/${resolvedTargetId}`, { withCredentials: true })
                    .catch(() => ({ data: { posts: [] } }))
            ]);

            const finalUser = userDatas?.data?.user || (isSelf ? selfUser : null);
            setUserData(finalUser);
            setPostData(postDatas?.data?.posts || []);
            setSavedPosts(savedDatas?.data?.posts || []);
            setTaggedPosts(taggedDatas?.data?.posts || []);

        } catch (err) {
            console.error("Profile load error:", err);
            if (currentUser || cachedUser) {
                setUserData(currentUser || cachedUser);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleUnsavePost = async (e, postId) => {
        e.stopPropagation();
        try {
            setSavedPosts(prev => prev.filter(p => p._id !== postId));
            await axios.post('http://localhost:4000/api/post/save/' + postId, {}, { withCredentials: true });
            toast.success('Post removed from saved items');
        } catch (err) {
            toast.error('Failed to unsave post');
        }
    };

    const handleMessageModal = () => {
        setMessageModal(prev => !prev)
    }

    const handleExpModal = () => {
        if (expModal) {
            setUpdateExp({ clicked: false, id: "", data: {} });
        } else {
            setUpdateExp({ clicked: false, id: "", data: {} });
        }
        setExpModal(prev => !prev);
    };

    const handleAboutModal = () => {
        setAboutModal(prev => !prev)
    }

    const handleInfoModal = () => {
        setInfoModal(prev => !prev)
    }

    const handleImageModalOpenClose = () => {
        setImageModal(prev => !prev)
    }

    const handleOnEditCover = () => {
        setImageModal(true);
        setCircularImage(false);
    }

    const handleCircularImageOpen = () => {
        setImageModal(true);
        setCircularImage(true);
    }
    const copyToClipboard = () => {
        try {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Profile link copied to clipboard!");
        } catch (e) {
            toast.info("Profile URL: " + window.location.href);
        }
    };


    // To Update User Details with Global Auth Context Sync without Hard Reload.
    const handleEditFunc = async (data) => {
        try {
            await updateCurrentUser(data);
            // Use function form to avoid stale closure; overwrite arrays directly
            setUserData(prev => ({
                ...prev,
                ...data,
                experience: data.experience !== undefined ? data.experience : prev?.experience
            }));
            setOwnData(prev => ({
                ...prev,
                ...data,
                experience: data.experience !== undefined ? data.experience : prev?.experience
            }));
            setImageModal(false);
            setInfoModal(false);
            setAboutModal(false);
            // Don't close expModal here — ExpModal calls closeModal itself
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.");
        }
    };

    // To check we are Friends or Not.
    const amIfriend = () => {  // userData = Smit, ownData = Anand.
        let arr = userData?.friends?.filter((item) => { return item === ownData?._id })
        return arr?.length;
    }

    // Check if user is in Pending List or Not in other(Anand) Pending List.
    const isInPendingList = () => {
        let arr = userData?.pending_friends?.filter((item) => { return item === ownData?._id })
        return arr?.length;
    }

    // Check if user is in Pending List or Not in self(smit) Pending List.
    const isInSelfPendingList = () => {
        let arr = ownData?.pending_friends?.filter((item) => { return item === userData?._id })
        return arr?.length;
    }

    // Checking Friends Status
    const checkFriendStatus = () => {
        if (amIfriend()) {
            return "Disconnect";
        } else if (isInSelfPendingList()) {
            return "Approve Request"
        } else if (isInPendingList()) {
            return "Request Sent"
        }
        else {
            return "Connect"
        }
    }

    // To Send, Approve and Disconnect Friend Request.
    const handleSendFriendRequest = async () => {
        if (checkFriendStatus() === "Request Sent") return;

        if (checkFriendStatus() === "Connect") {
            await axios.post('http://localhost:4000/api/auth/sendFriendReq', { reciever: userData?._id }, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error)
            })
        } else if (checkFriendStatus() === "Approve Request") {
            await axios.post('http://localhost:4000/api/auth/acceptFriendRequest', { friendId: userData?._id }, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error)
            })
        }
        else {
            await axios.delete(`http://localhost:4000/api/auth/removeFromFriendList/${userData?._id}`, { withCredentials: true }).then(res => {
                toast.success(res.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }).catch(err => {
                console.log(err);
                toast.error(err?.response?.data?.error)
            })
        }
    }

    const handleLogout = async () => {
        await logout();
    }

    if (loading && !userData) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#0a66c2] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-gray-500">Loading profile...</span>
                </div>
            </div>
        );
    }

    if (!loading && !userData) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
                <div className="text-center p-8 rounded-2xl max-w-sm border shadow-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Profile Not Found</h2>
                    <p className="text-xs text-gray-500 mb-5">This profile might be unavailable or removed.</p>
                    <Link to="/feeds" className="px-5 py-2 rounded-full bg-[#0a66c2] text-white text-xs font-semibold hover:bg-[#004182]">
                        Back to Home Feed
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className='min-h-[calc(100vh-64px)] px-4 sm:px-8 xl:px-32 py-6 flex flex-col gap-5 w-full transition-colors duration-300'
            style={{
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
            }}
        >
            <div className='flex flex-col lg:flex-row justify-between gap-6'>

                {/* Left Side Main Section. */}
                <div className='w-full lg:w-[70%]'>
                    <div>
                        <Card padding={0}>
                            <div className='w-full h-fit'>
                                <div className='relative w-full h-[200px]'>

                                    {
                                        userData?._id === ownData?._id && (
                                            <div
                                                className='absolute cursor-pointer top-3 right-3 z-20 w-9 h-9 flex justify-center items-center rounded-full p-2 shadow-md hover:scale-105 transition-transform'
                                                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                                onClick={handleOnEditCover}
                                            >
                                                <EditIcon fontSize="small" />
                                            </div>
                                        )
                                    }

                                    <img
                                        className='w-full h-[200px] rounded-tr-xl rounded-tl-xl object-cover'
                                        src={userData?.cover_pic || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80'}
                                        alt="Profile Banner"
                                    />
                                    <div className='absolute object-cover top-24 left-6 z-10'>
                                        <img
                                            className='rounded-full cursor-pointer w-32 h-32 sm:w-36 sm:h-36 object-cover ring-4 ring-[var(--bg-card)] shadow-lg hover:scale-105 transition-transform'
                                            onClick={handleCircularImageOpen}
                                            src={userData?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                            alt={userData?.f_name || "Profile"}
                                        />
                                    </div>
                                </div>

                                <div className='mt-12 relative px-6 sm:px-8 py-3'>

                                    {
                                        userData?._id === ownData?._id && (
                                            <div
                                                className='absolute cursor-pointer top-0 right-4 z-20 w-9 h-9 flex justify-center items-center rounded-full p-2 shadow-md hover:scale-105 transition-transform'
                                                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                                onClick={handleInfoModal}
                                            >
                                                <EditIcon fontSize="small" />
                                            </div>
                                        )
                                    }

                                    <div className='w-full'>
                                        <div className='text-2xl font-bold' style={{ color: 'var(--text-primary)' }}> {userData?.f_name} </div>
                                        <div className='font-medium text-base mt-1' style={{ color: 'var(--text-secondary)' }}> {userData?.headline || (userData?._id === ownData?._id ? "Add a headline to stand out" : "")} </div>
                                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2'> {userData?.curr_location || (userData?._id === ownData?._id ? "Add your location to discover local opportunities" : "")} </div>
                                        <div className='text-sm text-[#0a66c2] font-semibold w-fit cursor-pointer hover:underline'> {userData?.friends?.length || 0} Connections</div>

                                        <div className='flex flex-wrap items-center justify-between gap-3 mt-4'>
                                            <div className='flex flex-wrap gap-2.5'>
                                                <button className='cursor-pointer px-4 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs'>Open to</button>
                                                <button className='cursor-pointer px-4 py-2 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white text-xs font-bold transition-all shadow-xs' onClick={copyToClipboard} >Share</button>

                                                {
                                                    userData?._id === ownData?._id && <button onClick={handleLogout} className='cursor-pointer px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold transition-all'>Sign out</button>
                                                }

                                            </div>
                                            <div className='flex gap-2.5'>

                                                {
                                                    amIfriend() ? <button onClick={handleMessageModal} className='cursor-pointer px-4 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs'>Message</button> : null

                                                }

                                                {
                                                    userData?._id === ownData?._id ? null : <button onClick={handleSendFriendRequest} className='cursor-pointer px-4 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs'> {checkFriendStatus()} </button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </Card>
                    </div>

                    {/* About Section. */}
                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>About</div>

                                {
                                    userData?._id === ownData?._id && (
                                        <div
                                            onClick={handleAboutModal}
                                            className='cursor-pointer p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors'
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </div>
                                    )
                                }


                            </div>
                            {userData?.about ? (
                                <div className='text-sm w-[90%] mt-3 leading-relaxed' style={{ color: 'var(--text-primary)' }}> {userData.about} </div>
                            ) : (
                                <div className='text-xs text-gray-400 italic mt-3'>
                                    {userData?._id === ownData?._id ? "Write something about yourself to help others know you better." : "No about information provided."}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Skills Section. */}
                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>Skills</div>
                            </div>
                            <div className='text-sm my-4 w-full flex gap-2.5 flex-wrap'>

                                {userData?.skills && userData.skills.length > 0 ? (
                                    userData.skills.map((item, index) => {
                                        return (
                                            <div key={index} className='cursor-pointer px-4 py-1.5 border border-blue-500/30 rounded-full bg-blue-500/10 text-sky-600 dark:text-sky-400 font-semibold hover:bg-blue-500/20 text-xs transition-colors'> {item} </div>
                                        );
                                    })
                                ) : (
                                    <div className='text-xs text-gray-400 italic w-full'>
                                        {userData?._id === ownData?._id ? "Add some skills to showcase your expertise." : "No skills added yet."}
                                    </div>
                                )}

                            </div>
                        </Card>
                    </div>

                    {/* Activity Section with Slidable Carousel */}
                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center mb-2'>
                                <div className='flex items-center gap-3 flex-wrap'>
                                    <div className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>Activities</div>
                                    <div className='flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-full'>
                                        <button
                                            type="button"
                                            onClick={() => setActiveActivityTab('posts')}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                activeActivityTab === 'posts'
                                                    ? 'bg-[#0a66c2] text-white shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            Posts ({postData?.length || 0})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveActivityTab('tagged')}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                activeActivityTab === 'tagged'
                                                    ? 'bg-[#0a66c2] text-white shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            Tagged ({taggedPosts?.length || 0})
                                        </button>
                                    </div>
                                </div>

                                {/* Slider Navigation Controls */}
                                {postData && postData.length > 1 && (
                                    <div className='flex items-center gap-1.5'>
                                        <button
                                            onClick={() => scrollActivities('left')}
                                            className='p-1.5 rounded-full border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
                                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                            title="Scroll left"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => scrollActivities('right')}
                                            className='p-1.5 rounded-full border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer'
                                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                            title="Scroll right"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Slidable Carousel Container */}
                            <div
                                ref={activitiesScrollRef}
                                className='overflow-x-auto no-scrollbar my-3 flex gap-4 overflow-y-hidden w-full p-1 scroll-smooth'
                            >
                                {activeActivityTab === 'posts' ? (
                                    postData && postData.length > 0 ? (
                                        postData.map((item, ind) => (
                                            <div
                                                key={item?._id || ind}
                                                className='shrink-0 w-[300px] sm:w-[360px] md:w-[380px]'
                                            >
                                                <Post
                                                    profile={1}
                                                    item={item}
                                                    personalData={ownData}
                                                    onPostUpdated={fetchDataOnLoad}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-xs text-gray-400 italic p-6 w-full flex justify-center rounded-xl border border-dashed' style={{ borderColor: 'var(--border-color)' }}>
                                            {userData?._id === ownData?._id ? "You haven't posted anything yet. Share your thoughts with your network!" : "No activities yet."}
                                        </div>
                                    )
                                ) : (
                                    taggedPosts && taggedPosts.length > 0 ? (
                                        taggedPosts.map((item, ind) => (
                                            <div
                                                key={item?._id || ind}
                                                className='shrink-0 w-[300px] sm:w-[360px] md:w-[380px]'
                                            >
                                                <Post
                                                    profile={1}
                                                    item={item}
                                                    personalData={ownData}
                                                    onPostUpdated={fetchDataOnLoad}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-xs text-gray-400 italic p-6 w-full flex justify-center rounded-xl border border-dashed' style={{ borderColor: 'var(--border-color)' }}>
                                            No accepted tagged posts yet. When connections mention this user and the mention is accepted, they will appear here.
                                        </div>
                                    )
                                )}
                            </div>

                            {/* See All Action Link */}
                            <div className='w-full flex justify-center items-center mt-3 border-t pt-3' style={{ borderColor: 'var(--border-color)' }}>
                                <Link
                                    to={`/profile/${id}/activities`}
                                    className='px-4 py-2 font-bold text-xs rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5'
                                    style={{ color: '#0a66c2' }}
                                >
                                    <span>See all posts ({postData?.length || 0})</span>
                                    <ArrowRightAltIcon fontSize="small" />
                                </Link>
                            </div>
                        </Card>
                    </div>

                    {/* Experience Section. */}
                    <div className='mt-5'>
                        <Card padding={1}>
                            <div className='flex justify-between items-center'>
                                <div className='text-lg font-bold' style={{ color: 'var(--text-primary)' }}>Experience</div>

                                {
                                    userData?._id === ownData?._id && (
                                        <div
                                            onClick={handleExpModal}
                                            className='cursor-pointer p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors'
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            <AddIcon fontSize="small" />
                                        </div>
                                    )
                                }

                            </div>
                            <div className='mt-3 divide-y divide-[var(--border-color)]'>
                                {userData?.experience && userData.experience.length > 0 ? (
                                    userData.experience.map((item, index) => {
                                        const displayDuration = item.duration || (item.startDate ? `${item.startDate} - ${item.isCurrent ? 'Present' : (item.endDate || 'Present')}` : '');
                                        return (
                                            <div key={item._id || index} className='p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex justify-between gap-3 group transition-colors'>
                                                <div className='flex flex-col gap-1 max-w-[85%]'>
                                                    <div className='text-base font-bold' style={{ color: 'var(--text-primary)' }}> {item.designation} </div>
                                                    <div className='text-sm font-semibold' style={{ color: 'var(--text-secondary)' }}>
                                                        {item.company_name} {item.location ? `• ${item.location}` : ''}
                                                    </div>
                                                    {displayDuration && (
                                                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                                            {displayDuration}
                                                        </div>
                                                    )}
                                                    {item.description && (
                                                        <div className='text-xs mt-1.5 leading-relaxed whitespace-pre-line' style={{ color: 'var(--text-secondary)' }}>
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>

                                                {
                                                    userData?._id === ownData?._id && (
                                                        <div className='flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0 self-start'>
                                                            <button
                                                                onClick={() => { updateExpEdit(item._id, item) }}
                                                                className='cursor-pointer p-2 h-fit hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white'
                                                                title="Edit Experience"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(item._id)}
                                                                className='cursor-pointer p-2 h-fit hover:bg-red-500/10 rounded-full transition-colors text-gray-400 hover:text-red-500'
                                                                title="Delete Experience"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )
                                                }

                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className='text-xs text-gray-400 italic p-4'>
                                        {userData?._id === ownData?._id ? "Add your experience to build your professional profile." : "No experience listed."}
                                    </div>
                                )}
                            </div>

                            {/* Inline Delete Confirmation Overlay for list-level delete */}
                            {deleteConfirmId && (
                                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                                    <div
                                        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                                    >
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <Trash2 size={28} className="text-red-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                                    Delete Experience
                                                </h3>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    Are you sure you want to delete this experience? This action cannot be undone.
                                                </p>
                                            </div>
                                            <div className="flex gap-3 w-full pt-1">
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    className="flex-1 py-2.5 rounded-full border text-sm font-semibold transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExperience(deleteConfirmId)}
                                                    className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Saved Posts Section */}
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
                                            className='relative block border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-black/5 dark:bg-white/5 group'
                                            style={{ borderColor: 'var(--border-color)' }}
                                            onClick={() => { window.location.href = `/profile/${post.user?._id}/activities/${post._id}`; }}
                                        >
                                            {/* Unsave overlay button */}
                                            <button
                                                onClick={(e) => handleUnsavePost(e, post._id)}
                                                title="Unsave Post"
                                                className='absolute top-1.5 right-1.5 z-10 p-1 rounded-full
                                                           bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                                                           text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20
                                                           border border-red-200 dark:border-red-500/40 shadow-sm
                                                           transition-all cursor-pointer opacity-0 group-hover:opacity-100'
                                            >
                                                <BookmarkX size={12} />
                                            </button>

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
                                {/* Show All Saved Posts footer */}
                                <div className='w-full flex justify-center items-center mt-4 border-t pt-3' style={{ borderColor: 'var(--border-color)' }}>
                                    <Link
                                        to='/saved-posts'
                                        className='px-4 py-2 font-bold text-xs rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5'
                                        style={{ color: '#0a66c2' }}
                                    >
                                        <span>Show all saved posts ({savedPosts.length})</span>
                                        <ArrowRightAltIcon fontSize="small" />
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Account Security: Change Password */}
                    {userData?._id === ownData?._id && (
                        <div className='mt-5'>
                            <Card padding={false} className='p-6 shadow-xs border' style={{ borderColor: 'var(--border-color)' }}>
                                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                    <div>
                                        <div className='flex items-center gap-2 text-sm font-bold' style={{ color: 'var(--text-primary)' }}>
                                            <KeyRound size={18} className="text-[#0a66c2]" />
                                            <span>Sign-in & Security</span>
                                        </div>
                                        <p className='text-xs text-gray-500 mt-1 max-w-md'>
                                            Keep your account safe by updating your password regularly with our secure verification flow.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setChangePasswordModalOpen(true)}
                                        className='px-4 py-2.5 rounded-xl border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shadow-xs'
                                    >
                                        <Lock size={15} />
                                        <span>Change Password</span>
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Danger Zone: Account Management & Deletion */}
                    {userData?._id === ownData?._id && (
                        <div className='mt-5'>
                            <Card padding={false} className='p-6 border border-red-500/30 shadow-xs'>
                                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                    <div>
                                        <div className='flex items-center gap-2 text-sm font-bold text-[#cc1016]'>
                                            <ShieldAlert size={18} />
                                            <span>Account Management</span>
                                        </div>
                                        <p className='text-xs text-gray-500 mt-1 max-w-md'>
                                            Permanently delete your LinkPro account and wipe all your profile details, posts, comments, messages, and connections.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setDeleteModalOpen(true)}
                                        className='px-4 py-2.5 rounded-xl bg-[#cc1016] hover:bg-[#b20d12] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto shadow-xs'
                                    >
                                        <Trash2 size={15} />
                                        <span>Delete Account</span>
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}

                </div>


                {/* Right Side Main Section. */}
                <div className='hidden md:flex md:w-[28%]'>
                    <div className='sticky top-19'>
                        <Advertisement />
                    </div>
                </div>
            </div>

            {
                imageSetModal && <Modal title='Upload Image' closeModal={handleImageModalOpenClose} >
                    <ImageModal handleEditFunc={handleEditFunc} selfData={ownData} isCircular={circularImage} />
                </Modal>
            }

            {
                infoModal && <Modal title='Edit Info' closeModal={handleInfoModal} >
                    <EditInfoModal handleEditFunc={handleEditFunc} selfData={ownData} />
                </Modal>
            }

            {
                aboutModal && <Modal title="Edit About" closeModal={handleAboutModal}>
                    <AboutModal handleEditFunc={handleEditFunc} selfData={ownData} />
                </Modal>
            }

            {
                expModal && <Modal title={updateExp?.clicked ? "Edit Experience" : "Add Experience"} closeModal={handleExpModal}>
                    <ExpModal handleEditFunc={handleEditFunc} selfData={ownData} updateExp={updateExp} setUpdateExp={setUpdateExp} closeModal={handleExpModal} />
                </Modal>
            }

            {
                messageModal && <Modal title="Send Message" closeModal={handleMessageModal}>
                    <MessageModal selfData={ownData} userData={userData} />
                </Modal>
            }

            {
                changePasswordModalOpen && <Modal title="Change Password" closeModal={() => setChangePasswordModalOpen(false)}>
                    <ChangePasswordModal closeModal={() => setChangePasswordModalOpen(false)} />
                </Modal>
            }

            {
                deleteModalOpen && <Modal title="Delete Account" closeModal={() => setDeleteModalOpen(false)}>
                    <DeleteAccountModal closeModal={() => setDeleteModalOpen(false)} userEmail={ownData?.email} />
                </Modal>
            }

            <ToastContainer />
        </div>

    )
}

export default Profile