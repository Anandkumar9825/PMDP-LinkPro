import React from 'react';

const Card = ({ children, padding = true, className = '', hoverEffect = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full overflow-hidden transition-all duration-200 rounded-[22px] border ${
        hoverEffect ? 'hover:border-blue-500/30 hover:shadow-lg' : ''
      } ${
        padding ? 'p-5' : 'p-0'
      } ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {children}
    </div>
  );
};

export default Card;