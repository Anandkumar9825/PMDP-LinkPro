import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Camera, Image as ImageIcon, CheckCircle, Sparkles } from 'lucide-react';

const GoogleAvatarModal = ({ googlePicture, closeModal }) => {
  const { updateCurrentUser } = useAuth();
  const [selectedOption, setSelectedOption] = useState('google'); // 'google' | 'custom'
  const [customImage, setCustomImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCustomFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        setCustomImage(response.data.url);
        setSelectedOption('custom');
      }
    } catch (err) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const finalPicture = selectedOption === 'custom' && customImage ? customImage : googlePicture;
    if (finalPicture) {
      setLoading(true);
      try {
        await updateCurrentUser({ profilePic: finalPicture });
        toast.success('Profile photo updated!');
      } catch (err) {
        toast.error('Failed to save profile picture');
      } finally {
        setLoading(false);
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0a66c2]/10 text-[#0a66c2] mb-3">
          <Sparkles size={24} />
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Choose Your Profile Picture
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Welcome to LinkPro! Set up how you appear to connections and colleagues.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Option 1: Use Google Avatar */}
        <div
          onClick={() => setSelectedOption('google')}
          className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
            selectedOption === 'google'
              ? 'border-[#0a66c2] bg-[#0a66c2]/5 shadow-sm'
              : 'border-[var(--border-color)] hover:border-gray-400 bg-[var(--bg-card)]'
          }`}
        >
          <img
            src={googlePicture || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
            alt="Google Avatar"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-sky-500/50 mb-2.5"
          />
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            Google Photo
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5">Use your Google account avatar</span>
          {selectedOption === 'google' && (
            <CheckCircle size={16} className="text-[#0a66c2] mt-2" />
          )}
        </div>

        {/* Option 2: Upload Custom Photo */}
        <div
          onClick={() => setSelectedOption('custom')}
          className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
            selectedOption === 'custom'
              ? 'border-[#0a66c2] bg-[#0a66c2]/5 shadow-sm'
              : 'border-[var(--border-color)] hover:border-gray-400 bg-[var(--bg-card)]'
          }`}
        >
          {customImage ? (
            <img
              src={customImage}
              alt="Custom"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/50 mb-2.5"
            />
          ) : (
            <label
              htmlFor="googleCustomAvatarUpload"
              className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 border border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer mb-2.5 hover:bg-black/10 transition-colors"
            >
              <Camera size={20} className="text-gray-400" />
            </label>
          )}

          <input
            id="googleCustomAvatarUpload"
            type="file"
            accept="image/*"
            onChange={handleCustomFile}
            className="hidden"
          />

          <label
            htmlFor="googleCustomAvatarUpload"
            className="text-xs font-bold cursor-pointer hover:underline"
            style={{ color: 'var(--text-primary)' }}
          >
            {customImage ? 'Change Photo' : 'Upload Custom'}
          </label>
          <span className="text-[11px] text-gray-500 mt-0.5">Upload a device image</span>
          {selectedOption === 'custom' && customImage && (
            <CheckCircle size={16} className="text-[#0a66c2] mt-2" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={closeModal}
          className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <span>Continue</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoogleAvatarModal;
