import React, { useState } from 'react';
import Card from '../Card/card';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfileCard = ({ data }) => {
  const { currentUser } = useAuth();
  const [showFullBio, setShowFullBio] = useState(false);

  // If viewing own profile or if data is not provided, use global currentUser
  const user = data?._id === currentUser?._id || !data ? currentUser || data : data;

  const displayName = user?.f_name || 'My Profile';
  const displayHeadline = user?.headline || 'LinkPro Member';
  const profileImage =
    user?.profilePic ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const coverImage =
    user?.cover_pic ||
    user?.bgPic ||
    user?.coverPic ||
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80';

  const defaultBio =
    user?.about ||
    'LinkPro Member. Open to networking and new opportunities.';

  const connectionsCount = user?.friends?.length ? `${user.friends.length}+` : '0';

  return (
    <Card padding={false} className="shadow-sm">
      {/* Header Banner - Dynamic Background Cover Image */}
      <div className="relative h-24 w-full overflow-hidden rounded-t-[22px] bg-slate-800">
        <img
          src={coverImage}
          alt="Profile Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Profile Avatar Overlapping */}
      <div className="px-5 pt-0 pb-5">
        <div className="relative -mt-12 mb-3 flex justify-center">
          <Link
            to={`/profile/${user?._id || 'me'}`}
            className="group relative inline-block cursor-pointer"
          >
            <div
              className="w-20 h-20 rounded-full p-1 ring-2 ring-white/30 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <img
                src={profileImage}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </Link>
        </div>

        {/* User Identity */}
        <div className="text-center">
          <Link
            to={`/profile/${user?._id || 'me'}`}
            className="text-base font-bold tracking-tight hover:underline transition-colors block truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {displayName}
          </Link>
          <div className="text-xs font-medium text-sky-400 mt-0.5 truncate">
            {displayHeadline}
          </div>

          {/* User Bio */}
          <div className="text-[12px] text-gray-400 mt-3 leading-relaxed text-center px-1">
            {showFullBio ? (
              <span>
                {defaultBio}
                {defaultBio.length > 80 && (
                  <button
                    onClick={() => setShowFullBio(false)}
                    className="text-sky-400 font-semibold ml-1 cursor-pointer hover:underline"
                  >
                    Read less
                  </button>
                )}
              </span>
            ) : (
              <span>
                {defaultBio.length > 80 ? `${defaultBio.slice(0, 80)}.....` : defaultBio}
                {defaultBio.length > 80 && (
                  <button
                    onClick={() => setShowFullBio(true)}
                    className="text-sky-400 font-semibold ml-1 cursor-pointer hover:underline"
                  >
                    Read more
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t" style={{ borderColor: 'var(--border-color)' }} />

        {/* Statistics List */}
        <div className="space-y-2.5 text-xs font-semibold">
          <Link
            to="/myNetwork"
            className="flex justify-between items-center group py-0.5 rounded-md hover:px-1 transition-all"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="opacity-90 group-hover:opacity-100">Connections</span>
            <span className="text-[#0a66c2] font-bold">{connectionsCount}</span>
          </Link>

          <div className="flex justify-between items-center py-0.5" style={{ color: 'var(--text-primary)' }}>
            <span className="opacity-90">Profile Views</span>
            <span className="text-[#0a66c2] font-bold">120+</span>
          </div>

          <Link
            to="/resume"
            className="flex justify-between items-center py-0.5 group"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="opacity-90 group-hover:opacity-100">My Resume</span>
            <span className="text-[#0a66c2] font-bold">{user?.resume ? 'Active' : 'Add'}</span>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;