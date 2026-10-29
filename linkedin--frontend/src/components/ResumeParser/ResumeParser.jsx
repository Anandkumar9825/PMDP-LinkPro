import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

const ResumeParser = ({ currentUser, onUpdateComplete }) => {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  const handleParse = async () => {
    if (!resumeText.trim()) return alert("Please paste your resume text first.");
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:4000/api/ai/parse-resume',
        {
          resumeText,
          userId: currentUser?._id,
          applyToProfile: true
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setParsedData(res.data.extracted);
        alert("Profile successfully parsed and synchronized to database!");
        if (onUpdateComplete) onUpdateComplete(res.data.user || res.data.extracted);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to parse resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-2xl border shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-[#0a66c2]" />
        <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
          AI Resume Parser & Profile Auto-Fill
        </h4>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Paste your resume text below. GenAI will extract your Headline, About summary, and Skills, and automatically sync them to your profile.
      </p>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste resume text here..."
        rows={4}
        className="w-full p-2.5 mb-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
        style={{
          backgroundColor: 'var(--bg-input)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      />
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleParse}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a66c2] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition shadow"
        >
          {loading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Optimizing Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={13} />
              <span>Auto-Fill & Save Profile</span>
            </>
          )}
        </button>

        {parsedData && (
          <span className="text-[11px] text-emerald-500 font-semibold">
            ✓ Successfully synced {parsedData.skills?.length || 0} skills!
          </span>
        )}
      </div>
    </div>
  );
};

export default ResumeParser;
