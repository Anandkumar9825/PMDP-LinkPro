import React, { useEffect, useState } from 'react';
import { getPresenceStatus } from '../../utils/presence';

const Conversation = ({ item, ownData, handleSelectedConv, activeConvId, onlineUsers = [] }) => {
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    if (ownData && item?.members) {
      const ownId = ownData._id?.toString();
      const other = item.members.find((m) => m._id?.toString() !== ownId);
      setMemberData(other || item.members[0]);
    }
  }, [ownData, item]);

  const handleClick = () => {
    if (memberData) {
      handleSelectedConv(item._id, memberData);
    }
  };

  const presence = getPresenceStatus(memberData, onlineUsers);
  const isActive = activeConvId === item?._id;
  const unreadCount = item?.unreadCount || 0;

  return (
    <div
      onClick={handleClick}
      className={`flex items-center w-full cursor-pointer p-3.5 gap-3 transition-colors border-b ${
        isActive
          ? 'bg-sky-500/15 border-l-4 border-l-[#0a66c2]'
          : 'hover:bg-white/5'
      }`}
      style={{ borderColor: 'var(--border-color)' }}
    >
      <div className="relative shrink-0">
        <img
          className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-600/30"
          src={
            memberData?.profilePic ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          }
          alt={memberData?.f_name || 'Member'}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
          }}
        />
        {/* LinkedIn-style online green dot indicator */}
        {presence.showGreenDot && (
          <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-gray-900"></span>
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div
            className="text-xs font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {memberData?.f_name || 'User'}
          </div>

          <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
            {presence.isOnline && (
              <span className="text-[10px] text-[#057642] font-medium hidden sm:inline">Online</span>
            )}

            {/* Circular Unread Message Badge */}
            {unreadCount > 0 && !isActive && (
              <span className="min-w-[18px] h-4.5 px-1.5 bg-[#0a66c2] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="text-[11px] text-gray-400 truncate mt-0.5">
          {item?.lastMessage?.message || memberData?.headline || 'Start a conversation'}
        </div>
      </div>
    </div>
  );
};

export default Conversation;