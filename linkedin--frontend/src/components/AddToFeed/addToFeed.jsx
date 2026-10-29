import React, { useState } from 'react';
import Card from '../Card/card';
import { ArrowRight, Plus, Check } from 'lucide-react';

const AddToFeed = () => {
  const [followingMap, setFollowingMap] = useState({});

  const suggestions = [
    {
      id: 1,
      name: 'Michael Alexander',
      headline: 'UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Evan Steward',
      headline: 'Illustrator | UI Designer | Icon Designer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Jack Wilson',
      headline: 'Freelancer UI Design',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      name: 'Anton Robert',
      headline: '3D Designer',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      name: 'Jack Wilson',
      headline: 'Freelancer UI Design',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleToggleFollow = (id) => {
    setFollowingMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Card padding={false} className="shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Add to your feed
        </span>
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
          title="See more recommendations"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Suggested Users List */}
      <div className="space-y-3.5">
        {suggestions.map((user) => {
          const isFollowing = !!followingMap[user.id];
          return (
            <div key={user.id} className="flex items-center justify-between gap-3 group">
              {/* User Avatar + Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div
                    className="text-xs font-semibold truncate group-hover:text-sky-400 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user.name}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                    {user.headline}
                  </div>
                </div>
              </div>

              {/* Follow Button (+) */}
              <button
                onClick={() => handleToggleFollow(user.id)}
                aria-label={`Follow ${user.name}`}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer border ${
                  isFollowing
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : 'bg-transparent text-gray-400 border-gray-600/50 hover:text-white hover:border-white'
                }`}
              >
                {isFollowing ? <Check size={14} /> : <Plus size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AddToFeed;
