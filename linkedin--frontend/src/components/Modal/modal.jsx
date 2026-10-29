import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ closeModal, title, children }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-[24px] border shadow-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title || 'Create a post'}
          </h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
