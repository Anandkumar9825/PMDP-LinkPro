import React, { useState } from 'react';
import Card from '../Card/card';
import { ArrowRight, Hash } from 'lucide-react';

const HashtagsWidget = ({ onSelectTag, activeTag }) => {
  const hashtags = [
    '#uidesign',
    '#uxdesign',
    '#mobileappdesign',
    '#webdesign',
    '#uianimation',
  ];

  return (
    <Card padding={false} className="shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Followed hastags
        </span>
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
          title="Explore more hashtags"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Hashtags Chips */}
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag) => {
          const isSelected = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelectTag && onSelectTag(isSelected ? '' : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer border ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-sm'
                  : 'bg-[var(--bg-input)] text-gray-400 border-[var(--border-color)] hover:border-sky-400/40 hover:text-sky-300'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default HashtagsWidget;
