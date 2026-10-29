import React, { useEffect, useState } from 'react';
import Card from '../../components/Card/card';
import ProfileCard from '../../components/ProfileCard/profileCard';
import TopCourses from '../../components/TopCourses/topCourses';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  CheckCircle,
  Clock,
  Check
} from 'lucide-react';

const Notification = () => {
  const navigate = useNavigate();
  const [ownData, setOwnData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotificationData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/api/notification', {
        withCredentials: true,
      });
      if (res.data?.notifications) {
        // Exclusively social notifications (likes, comments, friend requests)
        const socialNotifs = res.data.notifications.filter((n) => n.type !== 'message');
        setNotifications(socialNotifs);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOnClickNotification = async (item) => {
    try {
      await axios.put(
        'http://localhost:4000/api/notification/isRead',
        { notificationId: item._id },
        { withCredentials: true }
      );
      // Trigger navbar badge count update
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {}

    // Update locally
    setNotifications((prev) =>
      prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
    );

    if (item.type === 'mention') {
      if (item.postId) {
        navigate(`/profile/${item.sender?._id || 'me'}/activities/${item.postId}`);
      } else {
        navigate('/feeds');
      }
    } else if (
      item.type === 'comment' ||
      item.type === 'like' ||
      item.type === 'comment_like' ||
      item.type === 'POST_LIKED' ||
      item.type === 'POST_COMMENTED'
    ) {
      const commentParam = item.commentId ? `?commentId=${item.commentId}` : '';
      if (item.postId) {
        navigate(`/profile/${ownData?._id || 'me'}/activities/${item.postId}${commentParam}`);
      } else {
        navigate(`/feeds${commentParam}`);
      }
    } else if (item.type === 'message') {
      navigate('/messages');
    } else {
      navigate('/myNetwork');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:4000/api/notification/markAllRead', {}, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notificationsUpdated'));
      toast.success('All notifications marked as read');
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notificationsUpdated'));
      toast.success('All notifications marked as read');
    }
  };

  useEffect(() => {
    const local = localStorage.getItem('userInfo');
    setOwnData(local ? JSON.parse(local) : null);
    fetchNotificationData();
  }, []);

  const getNotifIcon = (type) => {
    if (type === 'mention') {
      return (
        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
          @
        </div>
      );
    }
    if (type === 'like' || type === 'POST_LIKED') {
      return (
        <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
          <Heart size={11} className="fill-red-400" />
        </div>
      );
    }
    if (type === 'comment' || type === 'POST_COMMENTED') {
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={11} />
        </div>
      );
    }
    if (type === 'message') {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={11} />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
        <UserPlus size={11} />
      </div>
    );
  };

  return (
    <main className="min-h-screen px-4 sm:px-8 xl:px-24 py-6 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-[30%] lg:w-[25%] flex-shrink-0">
          <ProfileCard data={ownData} />
        </aside>

        {/* Middle Notification Feed */}
        <section className="flex-1 w-full flex flex-col gap-4">
          <Card padding={false} className="shadow-sm overflow-hidden">
            {/* Header */}
            <div
              className="p-4 px-5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#0a66c2]" />
                <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </h1>
              </div>

              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleOnClickNotification(item)}
                    className={`p-4 flex items-center gap-3.5 transition-colors cursor-pointer ${
                      item.isRead
                        ? 'hover:bg-white/5 opacity-80'
                        : 'bg-sky-500/10 hover:bg-sky-500/15'
                    }`}
                  >
                    {/* Sender Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          item.sender?.profilePic ||
                          'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                        }
                        alt="Sender"
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-600/30"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {getNotifIcon(item.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.content}
                      </p>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recently'}
                        </span>
                      </div>
                    </div>

                    {/* Unread indicator badge */}
                    {!item.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0a66c2] flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center p-6">
                <Bell size={36} className="text-gray-500 mb-2" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  No notifications yet
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  We'll notify you when someone interacts with your posts or sends you a request.
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex w-[28%] flex-shrink-0 flex-col gap-4">
          <TopCourses />
        </aside>

      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </main>
  );
};

export default Notification;