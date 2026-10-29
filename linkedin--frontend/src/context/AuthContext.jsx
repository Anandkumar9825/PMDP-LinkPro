import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../../socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('userInfo');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLogin, setIsLogin] = useState(() => {
    const saved = localStorage.getItem('isLogin');
    return saved === 'true' || saved === true;
  });

  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch logged in user details from MongoDB
  const refreshUser = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/auth/self', {
        withCredentials: true,
      });
      if (res.data?.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem('userInfo', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {}
    return null;
  };

  // Instant global update when user edits profile/skills/resume
  const updateCurrentUser = async (updatedFields) => {
    // Optimistic update
    const nextUser = { ...currentUser, ...updatedFields };
    setCurrentUser(nextUser);
    localStorage.setItem('userInfo', JSON.stringify(nextUser));

    try {
      const res = await axios.put(
        'http://localhost:4000/api/auth/update',
        { user: updatedFields },
        { withCredentials: true }
      );
      if (res.data?.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      }
    } catch (err) {}
  };

  // Fetch unread notification counts
  const fetchUnreadNotifs = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/notification/activeNotification', {
        withCredentials: true,
      });
      if (typeof res.data?.count === 'number') {
        setUnreadNotifCount(res.data.count);
      }
    } catch (e) {}
  };

  // Fetch unread message counts
  const fetchUnreadMessages = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/message/unread-total', {
        withCredentials: true,
      });
      if (typeof res.data?.totalUnread === 'number') {
        setUnreadMessageCount(res.data.totalUnread);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isLogin) {
      refreshUser();
      fetchUnreadNotifs();
      fetchUnreadMessages();
    }
  }, [isLogin]);

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit('registerUser', currentUser._id);
    }

    // Socket event listeners for real-time badges
    const handleNewNotif = () => {
      setUnreadNotifCount((prev) => prev + 1);
    };

    const handleNewUnreadMessage = () => {
      setUnreadMessageCount((prev) => prev + 1);
    };

    socket.on('newNotification', handleNewNotif);
    socket.on('newUnreadMessage', handleNewUnreadMessage);

    const handleNotifsUpdated = () => {
      fetchUnreadNotifs();
    };

    const handleMessagesUpdated = () => {
      fetchUnreadMessages();
    };

    const handleUserDataUpdated = () => {
      refreshUser();
    };

    window.addEventListener('notificationsUpdated', handleNotifsUpdated);
    window.addEventListener('messagesUpdated', handleMessagesUpdated);
    window.addEventListener('userUpdated', handleUserDataUpdated);

    return () => {
      socket.off('newNotification', handleNewNotif);
      socket.off('newUnreadMessage', handleNewUnreadMessage);
      window.removeEventListener('notificationsUpdated', handleNotifsUpdated);
      window.removeEventListener('messagesUpdated', handleMessagesUpdated);
      window.removeEventListener('userUpdated', handleUserDataUpdated);
    };
  }, [currentUser?._id]);

  const changeLoginValue = (val) => {
    const bool = val === true || val === 'true';
    setIsLogin(bool);
    localStorage.setItem('isLogin', bool ? 'true' : 'false');
    if (!bool) {
      setCurrentUser(null);
      localStorage.removeItem('userInfo');
    } else {
      refreshUser();
    }
  };

  // Robust Logout function with complete session and socket cleanup
  const logout = async () => {
    try {
      if (currentUser?._id) {
        socket.emit('unregisterUser', currentUser._id);
      }
      socket.disconnect();
    } catch (e) {}

    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
    } catch (e) {}

    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    setIsLogin(false);
    setUnreadNotifCount(0);
    setUnreadMessageCount(0);

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateCurrentUser,
        refreshUser,
        isLogin,
        changeLoginValue,
        logout,
        unreadNotifCount,
        setUnreadNotifCount,
        unreadMessageCount,
        setUnreadMessageCount,
        fetchUnreadNotifs,
        fetchUnreadMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
