import React, { useState } from 'react';
import Card from '../Card/card';
import { Users, ChevronRight } from 'lucide-react';

const GroupsWidget = () => {
  const [showAll, setShowAll] = useState(false);

  const initialGroups = [
    {
      id: 1,
      badgeText: 'UI/UX',
      badgeBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
      name: 'UI/UX Design inspiration',
      members: '48.2k members',
    },
    {
      id: 2,
      badgeText: 'Pro D',
      badgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      name: 'Pro Designer',
      members: '19.5k members',
    },
  ];

  const extraGroups = [
    {
      id: 3,
      badgeText: 'Figma',
      badgeBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
      name: 'Figma Masters Community',
      members: '64.1k members',
    },
    {
      id: 4,
      badgeText: 'React',
      badgeBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
      name: 'React & Frontend Innovators',
      members: '82.9k members',
    },
  ];

  const displayGroups = showAll ? [...initialGroups, ...extraGroups] : initialGroups;

  return (
    <Card padding={false} className="shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Group
        </span>
        <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
          12
        </span>
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        {displayGroups.map((group) => (
          <div
            key={group.id}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${group.badgeBg}`}
            >
              {group.badgeText}
            </div>
            <span
              className="text-xs font-medium line-clamp-1 group-hover:text-sky-400 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {group.name}
            </span>
          </div>
        ))}
      </div>

      {/* Show all button */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full mt-3 pt-2.5 border-t flex items-center justify-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <Users size={14} />
        <span>{showAll ? 'Show less' : 'Show all'}</span>
      </button>
    </Card>
  );
};

export default GroupsWidget;
