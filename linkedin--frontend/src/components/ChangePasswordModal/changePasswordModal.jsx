import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

const ChangePasswordModal = ({ closeModal }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!currentPassword.trim()) {
      return toast.error('Please enter your current password.');
    }

    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match.');
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:4000/api/auth/change-password',
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      toast.success(res.data?.message || 'Password updated successfully! A confirmation email has been sent.');
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#0a66c2] mb-5">
        <ShieldCheck size={24} className="flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold">Secure Password Update</h4>
          <p className="text-[11px] opacity-90 mt-0.5">
            You will receive a confirmation security email once your password is changed.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Current Password
          </label>
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 relative"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
            }}
          >
            <Lock size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type={showCurrent ? 'text' : 'password'}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-transparent text-xs outline-none pr-7 placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            New Password
          </label>
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 relative"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
            }}
          >
            <KeyRound size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent text-xs outline-none pr-7 placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Confirm New Password
          </label>
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
            }}
          >
            <KeyRound size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent text-xs outline-none placeholder:text-gray-500"
              style={{ color: 'var(--text-primary)' }}
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-full border border-gray-400/40 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordModal;
