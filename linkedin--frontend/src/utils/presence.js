/**
 * Format user presence status for LinkPro messaging
 * The online dot should be seen when the user is logged in only.
 * @param {Object} user - User object with optional lastSeen and headline
 * @param {Array} onlineUsers - List of user IDs currently active on Socket.io
 * @returns {Object} { isOnline: boolean, label: string, color: string, showGreenDot: boolean }
 */
export const getPresenceStatus = (user, onlineUsers = []) => {
  if (!user || !user._id) {
    return {
      isOnline: false,
      label: 'Offline',
      color: '#666666',
      showGreenDot: false,
    };
  }

  const userIdStr = user._id.toString();
  // ONLY true when the user is actively logged in and connected via Socket.io right now
  const isOnline = Array.isArray(onlineUsers) && onlineUsers.some((id) => id?.toString() === userIdStr);

  if (isOnline) {
    return {
      isOnline: true,
      label: 'Active now',
      color: '#057642',
      showGreenDot: true,
    };
  }

  // If user has lastSeen timestamp
  if (user.lastSeen) {
    const lastSeenDate = new Date(user.lastSeen);
    const diffMs = Date.now() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Recently Active (< 24 hours)
    if (diffMins < 1) {
      return {
        isOnline: false,
        label: 'Active just now',
        color: '#666666',
        showGreenDot: false,
      };
    }

    if (diffMins < 60) {
      return {
        isOnline: false,
        label: `Active ${diffMins}m ago`,
        color: '#666666',
        showGreenDot: false,
      };
    }

    if (diffHours < 24) {
      return {
        isOnline: false,
        label: `Active ${diffHours}h ago`,
        color: '#666666',
        showGreenDot: false,
      };
    }

    // Inactive (> 24 hours and <= 7 days) -> "Last seen [Month Day]"
    if (diffDays <= 7) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[lastSeenDate.getMonth()];
      const day = lastSeenDate.getDate();
      return {
        isOnline: false,
        label: `Last seen ${month} ${day}`,
        color: '#666666',
        showGreenDot: false,
      };
    }
  }

  // Inactive / Long absence (> 7 days or no lastSeen) -> Show headline or Offline
  return {
    isOnline: false,
    label: user.headline || 'Offline',
    color: '#666666',
    showGreenDot: false,
  };
};
