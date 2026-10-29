import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SmartCommentSuggestions = ({ postId, postContent, onSelectSuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:4000/api/ai/comment-suggestions', { postContent, postId }, { withCredentials: true, timeout: 300000 });
        setSuggestions(res.data.suggestions);
      } catch (error) {
        console.error("Failed to load suggestions", error);
      } finally {
        setLoading(false);
      }
    };

    if (postContent) {
      fetchSuggestions();
    }
  }, [postContent]);

  if (loading) return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <div style={{ background: '#e0e0e0', height: '24px', width: '80px', borderRadius: '12px' }}></div>
      <div style={{ background: '#e0e0e0', height: '24px', width: '100px', borderRadius: '12px' }}></div>
    </div>
  );
  if (!suggestions.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
      {suggestions.map((sug, i) => (
        <button 
          key={i}
          type="button"
          onClick={() => onSelectSuggestion(sug)}
          style={{
            padding: '4px 12px',
            backgroundColor: '#f3f2ef',
            color: '#0a66c2',
            border: '1px solid #0a66c2',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ✨ {sug}
        </button>
      ))}
    </div>
  );
};

export default SmartCommentSuggestions;
