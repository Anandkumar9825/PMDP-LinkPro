import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Image, Video, X, AtSign, Users, Search, Check } from 'lucide-react';
import AiPostGenerator from '../AiPostGenerator/AiPostGenerator';

const AddModal = ({ personalData, closeModal, initialType = 'text', onPostCreated }) => {
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [postType, setPostType] = useState(initialType);

  // Mention Friends State
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/auth/friendsList', { withCredentials: true })
      .then((res) => setFriends(res.data?.friends || []))
      .catch(() => {});
  }, []);

  const toggleFriendMention = (friend) => {
    setSelectedFriends((prev) => {
      const exists = prev.some((f) => f._id === friend._id);
      if (exists) {
        return prev.filter((f) => f._id !== friend._id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const filteredFriends = friends.filter((f) =>
    (f.f_name || '').toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handlePost = async () => {
    if (!desc.trim() && !imageUrl) {
      toast.error('Please write something or attach an image.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:4000/api/post',
        {
          desc: desc,
          imageLink: imageUrl,
          mentions: selectedFriends.map((f) => f._id),
        },
        { withCredentials: true }
      );

      const realPost = res.data.post;

      toast.success(
        selectedFriends.length > 0
          ? `Post published! Notification sent to ${selectedFriends.length} mentioned friend(s).`
          : 'Post published successfully!'
      );
      if (onPostCreated) {
        onPostCreated(realPost);
      }
      if (closeModal) {
        closeModal();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post. Please try again.');
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'linkedInClone');

    setIsUploading(true);
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dmnhbiouy/image/upload',
        data
      );
      if (response.data?.url) {
        setImageUrl(response.data.url);
      }
    } catch (err) {
      // Local preview persists
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 relative">
      {/* User Info Header */}
      <div className="flex items-center gap-3">
        <img
          src={
            personalData?.profilePic ||
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'
          }
          alt="Avatar"
          className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-500/30"
        />
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {personalData?.f_name || 'LinkPro Member'}
          </div>
          <div className="text-xs text-sky-500 font-medium">Post to Anyone 🌐</div>
        </div>
      </div>

      {/* Selected Mentions Badges */}
      {selectedFriends.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center p-2 rounded-xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40">
          <span className="text-xs font-semibold text-[#0a66c2] dark:text-sky-400 flex items-center gap-1">
            <AtSign size={12} /> Mentioning:
          </span>
          {selectedFriends.map((f) => (
            <span
              key={f._id}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-[#0a66c2] dark:text-sky-300 border border-blue-200 dark:border-slate-700 shadow-xs"
            >
              <img
                src={
                  f.profilePic ||
                  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                }
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
              <span>{f.f_name}</span>
              <button
                type="button"
                onClick={() => toggleFriendMention(f)}
                className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"
                title="Remove mention"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Text Input & AI Generator */}
      <div>
        <AiPostGenerator currentText={desc} setPostText={setDesc} />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder="What do you want to talk about? (e.g. earned a certificate, completed a course, built a project...)"
          className="w-full bg-transparent text-sm outline-none resize-none p-1 placeholder:text-gray-500 leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
          autoFocus
        />
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <div
          className="relative rounded-2xl overflow-hidden border max-h-56"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            onClick={() => setImageUrl(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mention Friends Picker Popup */}
      {showMentionPicker && (
        <div
          className="p-3 rounded-2xl border shadow-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 z-30"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <Users size={14} className="text-[#0a66c2]" />
              <span>Mention Friends ({friends.length} Connections)</span>
            </div>
            <button
              onClick={() => setShowMentionPicker(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 mb-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search connection..."
              value={mentionSearch}
              onChange={(e) => setMentionSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Friends List */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => {
                const isSelected = selectedFriends.some((f) => f._id === friend._id);
                return (
                  <div
                    key={friend._id}
                    onClick={() => toggleFriendMention(friend)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0a66c2] dark:text-sky-300 font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          friend.profilePic ||
                          'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                        }
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="leading-tight font-medium">{friend.f_name}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[160px]">
                          {friend.headline || 'LinkPro Member'}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#0a66c2] border-[#0a66c2] text-white'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check size={10} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-gray-400">
                {friends.length === 0
                  ? 'Connect with members first to mention them in your posts.'
                  : 'No matching connection found.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Tools & Action Buttons */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Attachments & Mention Button */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="photoUpload"
            className="p-2 rounded-full text-blue-400 hover:bg-blue-500/10 cursor-pointer transition-colors"
            title="Add Photo"
          >
            <Image size={18} />
          </label>
          <input
            id="photoUpload"
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            className="hidden"
          />

          <label
            htmlFor="videoUpload"
            className="p-2 rounded-full text-emerald-500 hover:bg-emerald-500/10 cursor-pointer transition-colors"
            title="Add Video"
          >
            <Video size={18} />
          </label>
          <input
            id="videoUpload"
            type="file"
            accept="video/*"
            onChange={handleUploadImage}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setShowMentionPicker(!showMentionPicker)}
            className={`p-2 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
              selectedFriends.length > 0 || showMentionPicker
                ? 'bg-blue-100 text-[#0a66c2] dark:bg-blue-900/40 dark:text-sky-300'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Mention Friends"
          >
            <AtSign size={17} />
            <span className="hidden sm:inline">
              {selectedFriends.length > 0 ? `${selectedFriends.length} tagged` : 'Tag Friends'}
            </span>
          </button>
        </div>

        {/* Submit Post */}
        <button
          onClick={handlePost}
          disabled={isUploading}
          className="bg-[#0a66c2] hover:bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default AddModal;
