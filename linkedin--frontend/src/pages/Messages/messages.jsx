import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../../components/Card/card';
import Conversation from '../../components/Conversation/conversation';
import axios from 'axios';
import socket from '../../../socket';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';
import {
  Send,
  Image as ImageIcon,
  MoreVertical,
  Search,
  MessageSquare,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Trash2,
  Download,
  Ban,
  ChevronDown,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import { getPresenceStatus } from '../../utils/presence';

const Messages = () => {
  const { currentUser, setUnreadMessageCount } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [selectedConvDetails, setSelectedConDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLink, setImageLink] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Menus & Modals
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null); // { message, isMe }

  const messagesEndRef = useRef(null);
  const activeConvIdRef = useRef(activeConvId);
  activeConvIdRef.current = activeConvId;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.message-action-menu') && !e.target.closest('.message-action-trigger')) {
        setActiveMessageMenu(null);
      }
      if (!e.target.closest('.header-menu') && !e.target.closest('.header-menu-trigger')) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  // Mark messages in conversation as read
  const markMessagesAsRead = useCallback(async (convId) => {
    if (!convId || !currentUser?._id) return;
    try {
      await axios.put(`http://localhost:4000/api/message/read/${convId}`, {}, {
        withCredentials: true,
      });
      socket.emit('markMessagesRead', { convId, readerId: currentUser._id });
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (err) {}
  }, [currentUser]);

  // Handle Conversation Selection
  const handleSelectedConv = (id, userData) => {
    if (activeConvId) {
      socket.emit('leaveConversation', activeConvId);
    }
    setActiveConvId(id);
    socket.emit('joinConversation', id);
    setSelectedConDetail(userData);

    // Reset unread badge in sidebar for this conversation
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
    );

    markMessagesAsRead(id);
  };

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await axios.get(`http://localhost:4000/api/message/${convId}`, {
        withCredentials: true,
      });
      if (res.data?.message) {
        setMessages(res.data.message);
      }
    } catch (err) {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      markMessagesAsRead(activeConvId);
    }
  }, [activeConvId, fetchMessages, markMessagesAsRead]);

  // Real-time socket event listeners with deduplication and deletion sync
  useEffect(() => {
    const handleReceive = (incomingMessage) => {
      if (!incomingMessage) return;

      const currentActive = activeConvIdRef.current;

      if (incomingMessage.conversation === currentActive) {
        setMessages((prev) => {
          const isDuplicate = prev.some((m) => {
            if (m._id && incomingMessage._id && m._id === incomingMessage._id) return true;
            if (
              m.clientMessageId &&
              incomingMessage.clientMessageId &&
              m.clientMessageId === incomingMessage.clientMessageId
            )
              return true;
            return false;
          });

          if (isDuplicate) return prev;
          return [...prev, incomingMessage];
        });

        markMessagesAsRead(currentActive);
      } else {
        // Increment badge for background conversation
        setConversations((prev) =>
          prev.map((c) =>
            c._id === incomingMessage.conversation
              ? {
                  ...c,
                  unreadCount: (c.unreadCount || 0) + 1,
                  lastMessage: incomingMessage,
                }
              : c
          )
        );
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleMessagesMarkedRead = ({ convId }) => {
      if (convId === activeConvIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender?._id?.toString() === currentUser?._id?.toString() || msg.sender === currentUser?._id
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }
    };

    const handleMessageDeletedForEveryone = ({ convId, messageId }) => {
      if (convId === activeConvIdRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeletedForEveryone: true, message: 'This message was deleted', picture: '' }
              : msg
          )
        );
      }
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === convId && c.lastMessage?._id === messageId) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                isDeletedForEveryone: true,
                message: 'This message was deleted',
                picture: '',
              },
            };
          }
          return c;
        })
      );
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('getOnlineUsers', handleOnlineUsers);
    socket.on('messagesMarkedRead', handleMessagesMarkedRead);
    socket.on('messageDeletedForEveryone', handleMessageDeletedForEveryone);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('getOnlineUsers', handleOnlineUsers);
      socket.off('messagesMarkedRead', handleMessagesMarkedRead);
      socket.off('messageDeletedForEveryone', handleMessageDeletedForEveryone);
    };
  }, [currentUser, markMessagesAsRead]);

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit('registerUser', currentUser._id);
    }
    fetchConversations(currentUser);
  }, [currentUser]);

  const fetchConversations = async (user) => {
    try {
      const res = await axios.get('http://localhost:4000/api/conversation/get-conversation', {
        withCredentials: true,
      });
      if (res.data?.conversations && res.data.conversations.length > 0) {
        setConversations(res.data.conversations);
        if (!activeConvId) {
          const first = res.data.conversations[0];
          setActiveConvId(first._id);
          socket.emit('joinConversation', first._id);

          const other = first.members?.find((m) => m._id?.toString() !== user?._id?.toString());
          setSelectedConDetail(other || first.members[0]);
          markMessagesAsRead(first._id);
        }
      } else {
        setConversations([]);
      }
    } catch (err) {
      setConversations([]);
    }
  };

  const handleInputImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImageLink(localUrl);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'linkedInClone');

    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dmnhbiouy/image/upload',
        data
      );
      if (response.data?.url) {
        setImageLink(response.data.url);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !imageLink) return;

    const clientMsgId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const receiverId = selectedConvDetails?._id;

    const outgoingMessage = {
      _id: clientMsgId,
      clientMessageId: clientMsgId,
      sender: currentUser || {
        _id: 'me',
        f_name: 'You',
        profilePic: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
      },
      conversation: activeConvId,
      message: messageText,
      picture: imageLink,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    // 1. Optimistically append message
    setMessages((prev) => [...prev, outgoingMessage]);

    // 2. Broadcast via socket to receiver
    socket.emit('sendMessage', activeConvId, outgoingMessage, receiverId);

    // 3. Update sidebar preview
    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConvId ? { ...c, lastMessage: outgoingMessage } : c
      )
    );

    const currentMsg = messageText;
    const currentImg = imageLink;
    setMessageText('');
    setImageLink(null);

    // 4. Save to backend database
    try {
      const res = await axios.post(
        'http://localhost:4000/api/message',
        {
          conversation: activeConvId,
          message: currentMsg,
          picture: currentImg,
        },
        { withCredentials: true }
      );
      if (res.data?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === clientMsgId || m.clientMessageId === clientMsgId ? res.data : m))
        );
      }
    } catch (err) {}
  };

  // WhatsApp-style: Delete for everyone
  const handleDeleteForEveryone = async (messageId) => {
    if (!messageId) return;
    try {
      await axios.delete(`http://localhost:4000/api/message/delete-for-everyone/${messageId}`, {
        withCredentials: true,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeletedForEveryone: true, message: 'This message was deleted', picture: '' }
            : m
        )
      );

      socket.emit('deleteMessageForEveryone', { convId: activeConvId, messageId });

      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === activeConvId && c.lastMessage?._id === messageId) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                isDeletedForEveryone: true,
                message: 'This message was deleted',
                picture: '',
              },
            };
          }
          return c;
        })
      );

      toast.success('Message deleted for everyone');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete message for everyone');
    }
  };

  // WhatsApp-style: Delete for me
  const handleDeleteForMe = async (messageId) => {
    if (!messageId) return;
    try {
      await axios.delete(`http://localhost:4000/api/message/delete-for-me/${messageId}`, {
        withCredentials: true,
      });

      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success('Message deleted for you');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete message for you');
    }
  };

  // Clear Chat for current user
  const handleClearChat = async () => {
    if (!activeConvId) return;
    try {
      await axios.delete(`http://localhost:4000/api/message/clear-chat/${activeConvId}`, {
        withCredentials: true,
      });

      setMessages([]);
      setConversations((prev) =>
        prev.map((c) => (c._id === activeConvId ? { ...c, lastMessage: null } : c))
      );
      setShowClearConfirmModal(false);
      toast.success('Chat cleared successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to clear chat');
    }
  };

  // Helper to convert remote image URL to base64 DataURL for PDF export
const loadImageToDataUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 500;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ dataUrl, width: w, height: h });
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 5000);
    img.src = url;
  });
};

  // Export Chat to PDF (Includes LinkPro branding, text, images, timestamps)
  const handleExportChatPDF = async () => {
    if (!messages || messages.length === 0) {
      toast.info('No messages to export.');
      return;
    }

    const toastId = toast.loading('Exporting LinkPro chat with images...');

    try {
      // 1. Preload any message pictures to DataURLs
      const imageMap = {};
      const imagePromises = messages
        .filter((m) => m.picture && !m.isDeletedForEveryone)
        .map(async (m) => {
          if (!imageMap[m.picture]) {
            imageMap[m.picture] = await loadImageToDataUrl(m.picture);
          }
        });

      await Promise.all(imagePromises);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Header Banner (LinkPro Blue)
      doc.setFillColor(10, 102, 194);
      doc.rect(0, 0, pageWidth, 24, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('LinkPro Chat Export', margin, 15);

      // Meta timestamp in header
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const nowStr = new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(`Exported: ${nowStr}`, pageWidth - margin, 15, { align: 'right' });

      // Conversation Info Card
      let y = 32;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const meName = currentUser?.f_name || 'You';
      const partnerName = selectedConvDetails?.f_name || 'User';
      doc.text(`LinkPro Conversation: ${meName} & ${partnerName}`, margin + 4, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Total Messages: ${messages.length}`, margin + 4, y + 13);

      y += 25;

      // Render Messages
      for (const msg of messages) {
        const isMe =
          msg.sender?._id?.toString() === currentUser?._id?.toString() ||
          msg.sender === currentUser?._id ||
          (typeof msg.sender === 'string' && msg.sender === currentUser?._id?.toString());

        const senderName = isMe ? meName : (msg.sender?.f_name || partnerName);
        const timeStr = msg.createdAt
          ? new Date(msg.createdAt).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Date unavailable';

        let textContent = msg.message || '';
        if (msg.isDeletedForEveryone) {
          textContent = '[This message was deleted]';
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const messageLines = textContent ? doc.splitTextToSize(textContent, contentWidth - 8) : [];
        const textH = messageLines.length * 4.5;

        // Image measurement
        const imgObj = msg.picture && !msg.isDeletedForEveryone ? imageMap[msg.picture] : null;
        let imgW = 0;
        let imgH = 0;
        if (imgObj) {
          imgW = 55;
          imgH = (imgObj.height / imgObj.width) * imgW;
          if (imgH > 40) {
            imgH = 40;
            imgW = (imgObj.width / imgObj.height) * imgH;
          }
        }

        const blockHeight = 11 + textH + (imgObj ? imgH + 5 : 0) + 4;

        // Auto pagination
        if (y + blockHeight > pageHeight - 16) {
          doc.addPage();
          y = 15;
        }

        // Message Box background
        if (isMe) {
          doc.setFillColor(238, 242, 255); // Indigo/Blue tint
          doc.setDrawColor(218, 226, 253);
        } else {
          doc.setFillColor(248, 250, 252); // Slate tint
          doc.setDrawColor(226, 232, 240);
        }
        doc.roundedRect(margin, y, contentWidth, blockHeight - 2, 2, 2, 'FD');

        // Sender Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        if (isMe) {
          doc.setTextColor(10, 102, 194);
        } else {
          doc.setTextColor(30, 41, 59);
        }
        doc.text(senderName, margin + 4, y + 5.5);

        // Timestamp
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(timeStr, pageWidth - margin - 4, y + 5.5, { align: 'right' });

        // Message Text
        let curY = y + 10.5;
        if (messageLines.length > 0) {
          doc.setFont('helvetica', msg.isDeletedForEveryone ? 'italic' : 'normal');
          doc.setFontSize(8.5);
          if (msg.isDeletedForEveryone) {
            doc.setTextColor(148, 163, 184);
          } else {
            doc.setTextColor(15, 23, 42);
          }
          doc.text(messageLines, margin + 4, curY);
          curY += textH + 2;
        }

        // Embed Message Image directly into PDF
        if (imgObj) {
          try {
            doc.addImage(imgObj.dataUrl, 'JPEG', margin + 4, curY, imgW, imgH);
          } catch (e) {}
        }

        y += blockHeight;
      }

      // Page Numbers in Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`LinkPro Secure Messaging • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
      }

      const cleanName = partnerName.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`LinkPro_Chat_${cleanName}_${dateStr}.pdf`);

      toast.update(toastId, {
        render: 'LinkPro chat with images exported successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: 'Failed to export LinkPro chat to PDF.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const other = c.members?.find((m) => m._id?.toString() !== currentUser?._id?.toString());
    return other?.f_name?.toLowerCase().includes(searchFilter.toLowerCase()) ?? true;
  });

  return (
    <main className="min-h-screen px-3 sm:px-6 lg:px-12 xl:px-24 py-6 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-[1280px] h-[calc(100vh-120px)] min-h-[580px]">
        
        <Card padding={false} className="h-full flex overflow-hidden shadow-sm border">
          
          {/* ================= LEFT CONVERSATION LIST ================= */}
          <div
            className="w-full sm:w-80 md:w-96 flex flex-col border-r h-full bg-[var(--bg-card)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Header */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Messaging
              </h2>
            </div>

            {/* Search filter */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search messages"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-500"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filteredConversations.length > 0 ? (
                filteredConversations.map((item) => (
                  <Conversation
                    key={item._id}
                    item={item}
                    ownData={currentUser}
                    activeConvId={activeConvId}
                    handleSelectedConv={handleSelectedConv}
                    onlineUsers={onlineUsers}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  No conversations yet. Connect with users in your network to start chatting!
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT ACTIVE CHAT PANEL ================= */}
          <div className="hidden sm:flex flex-1 flex-col h-full bg-[var(--bg-card)]">
            {selectedConvDetails ? (
              <>
                {/* Chat Top Header */}
                {(() => {
                  const partnerPresence = getPresenceStatus(selectedConvDetails, onlineUsers);
                  return (
                    <div
                      className="p-3.5 px-5 border-b flex items-center justify-between relative"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              selectedConvDetails.profilePic ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={selectedConvDetails.f_name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-sky-500/40"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          {/* Live Green Active Dot Indicator */}
                          {partnerPresence.showGreenDot && (
                            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-gray-900"></span>
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                            {selectedConvDetails.f_name}
                          </div>
                          <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
                            {partnerPresence.isOnline ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                Active now
                              </span>
                            ) : (
                              <span className="text-gray-500">{partnerPresence.label}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions Menu (Clear Chat & Export Chat PDF) */}
                      <div className="relative">
                        <button
                          onClick={() => setHeaderMenuOpen((prev) => !prev)}
                          className="header-menu-trigger text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                          title="Chat Options"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {headerMenuOpen && (
                          <div
                            className="header-menu absolute right-0 mt-1 w-48 rounded-xl shadow-xl border py-1.5 z-40 bg-[var(--bg-card)] backdrop-blur-md"
                            style={{ borderColor: 'var(--border-color)' }}
                          >
                            <button
                              onClick={() => {
                                setHeaderMenuOpen(false);
                                handleExportChatPDF();
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <Download size={15} className="text-[#0a66c2]" />
                              <span>Export Chat (PDF)</span>
                            </button>

                            <button
                              onClick={() => {
                                setHeaderMenuOpen(false);
                                setShowClearConfirmModal(true);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2.5 text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                            >
                              <Trash2 size={15} />
                              <span>Clear Chat</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => {
                    const isMe =
                      msg.sender?._id?.toString() === currentUser?._id?.toString() ||
                      msg.sender === currentUser?._id ||
                      (typeof msg.sender === 'string' && msg.sender === currentUser?._id?.toString());

                    const isRead = msg.status === 'read';

                    return (
                      <div
                        key={msg._id || msg.clientMessageId || idx}
                        className={`group relative flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={
                              msg.sender?.profilePic ||
                              selectedConvDetails.profilePic ||
                              'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                            }
                            alt="Sender"
                            className="w-7 h-7 rounded-full object-cover mb-1 ring-1 ring-gray-300"
                          />
                        )}

                        <div className="relative group/bubble max-w-[70%]">
                          {/* Message Action Trigger (WhatsApp Hover Chevron) */}
                          <div
                            className={`absolute top-1 ${
                              isMe ? '-left-7' : '-right-7'
                            } opacity-0 group-hover/bubble:opacity-100 transition-opacity z-20`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageMenu(activeMessageMenu === msg._id ? null : msg._id);
                              }}
                              className="message-action-trigger p-1 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                              title="Message options"
                            >
                              <ChevronDown size={13} />
                            </button>

                            {/* Message Dropdown Menu */}
                            {activeMessageMenu === msg._id && (
                              <div
                                className={`message-action-menu absolute top-6 ${
                                  isMe ? 'right-0' : 'left-0'
                                } w-36 rounded-xl shadow-xl border py-1.5 z-30 bg-[var(--bg-card)] backdrop-blur-md`}
                                style={{ borderColor: 'var(--border-color)' }}
                              >
                                <button
                                  onClick={() => {
                                    setActiveMessageMenu(null);
                                    setDeleteModalData({ message: msg, isMe });
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs font-medium flex items-center gap-2 text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`rounded-[18px] p-3 text-xs leading-relaxed ${
                              msg.isDeletedForEveryone
                                ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 italic rounded-br-xs border border-dashed border-gray-300 dark:border-gray-700'
                                : isMe
                                ? 'bg-[#0a66c2] text-white rounded-br-xs'
                                : 'bg-[var(--bg-input)] text-[var(--text-primary)] rounded-bl-xs border border-[var(--border-color)]'
                            }`}
                          >
                            {msg.isDeletedForEveryone ? (
                              <div className="flex items-center gap-1.5 py-0.5">
                                <Ban size={13} className="shrink-0 text-gray-400" />
                                <span>{isMe ? 'You deleted this message' : 'This message was deleted'}</span>
                              </div>
                            ) : (
                              <>
                                {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}
                                {msg.picture && (
                                  <img
                                    src={msg.picture}
                                    alt="attachment"
                                    className="mt-2 rounded-xl max-h-48 object-cover"
                                  />
                                )}
                              </>
                            )}

                            {/* Timestamp and Read Receipts */}
                            <div
                              className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                                msg.isDeletedForEveryone
                                  ? 'text-gray-400'
                                  : isMe
                                  ? 'text-blue-100'
                                  : 'text-gray-400'
                              }`}
                            >
                              <span>
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Just now'}
                              </span>

                              {isMe && !msg.isDeletedForEveryone && (
                                <span title={isRead ? 'Read' : 'Delivered'}>
                                  {isRead ? (
                                    <CheckCheck size={13} className="text-cyan-300 stroke-[2.5]" />
                                  ) : (
                                    <CheckCheck size={13} className="text-blue-200/80 stroke-[2]" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image upload preview */}
                {imageLink && (
                  <div className="px-4 py-2 bg-black/5 dark:bg-black/20 flex items-center gap-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <img src={imageLink} alt="preview" className="w-12 h-12 object-cover rounded-lg border" />
                    <button
                      onClick={() => setImageLink(null)}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Input composer bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t flex items-center gap-2 bg-[var(--bg-card)]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <label
                    htmlFor="chatImageUpload"
                    className="p-2 rounded-full text-gray-500 hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    title="Send Image"
                  >
                    <ImageIcon size={18} />
                  </label>
                  <input
                    id="chatImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleInputImage}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 bg-[var(--bg-input)] text-xs rounded-full px-4 py-2.5 border outline-none focus:border-[#0a66c2]"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() && !imageLink}
                    className="w-9 h-9 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-sm"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare size={48} className="text-gray-400 mb-3" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  No Active Conversation
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Select a chat on the left or connect with users in your network to start messaging.
                </p>
              </div>
            )}
          </div>

        </Card>

      </div>

      {/* ================= WHATSAPP STYLE DELETE MODAL ================= */}
      {deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Delete message?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {deleteModalData.isMe && !deleteModalData.message.isDeletedForEveryone
                    ? 'You can delete this message for everyone or only for yourself.'
                    : 'This message will be removed from your chat history.'}
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-5">
              {deleteModalData.isMe && !deleteModalData.message.isDeletedForEveryone && (
                <button
                  onClick={() => {
                    handleDeleteForEveryone(deleteModalData.message._id);
                    setDeleteModalData(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Trash2 size={14} />
                  Delete for everyone
                </button>
              )}

              <button
                onClick={() => {
                  handleDeleteForMe(deleteModalData.message._id);
                  setDeleteModalData(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
                Delete for me
              </button>

              <button
                onClick={() => setDeleteModalData(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CLEAR CHAT CONFIRMATION MODAL ================= */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Clear this chat?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Messages in this chat will be cleared from your view. The other participant will keep their chat history.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Trash2 size={14} />
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </main>
  );
};

export default Messages;
