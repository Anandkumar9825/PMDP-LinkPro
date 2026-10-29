import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, X, Send, Sparkles, RefreshCw, User, Briefcase, Award } from 'lucide-react';

const QUICK_PROMPTS = [
  "How can I boost my resume's ATS score?",
  "Suggest 3 technical interview questions for a Full Stack role",
  "How do I explain a career transition or gap?",
  "Review my skills and recommend certifications"
];

const AiCoachDrawer = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I'm your GenAI Career Coach. Ask me anything about your resume, interview preparation, ATS optimization, or career positioning."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', text: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const history = updatedMessages.slice(1, -1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const res = await axios.post(
        'http://localhost:4000/api/ai/reviewer/conversations/new/messages',
        {
          message: textToSend,
          userId: currentUser?._id,
          userProfile: currentUser,
          history
        },
        { withCredentials: true, timeout: 60000 }
      );

      const reply = res.data?.reply || "I'm here to help optimize your career strategy. What specific area would you like to review?";
      setMessages([...updatedMessages, { role: 'model', text: reply }]);
    } catch (error) {
      console.error("AI Coach error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: 'model',
          text: "I'm currently optimizing my responses. For technical roles, ensure your resume highlights quantified impact, modern tech stacks (React, Node, Cloud), and clear STAR achievements."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <div
        className="w-full max-w-[420px] h-full shadow-2xl flex flex-col border-l transition-transform duration-300"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0a66c2] to-indigo-600 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>AI Career Coach</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-medium">GenAI</span>
              </h3>
              <p className="text-[11px] text-blue-100">Resume & Interview Mentor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div
          className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin"
          style={{ backgroundColor: 'var(--bg-main)' }}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex gap-2 max-w-[88%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {!isUser ? (
                  <div className="w-6 h-6 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={12} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0a66c2] text-white rounded-tr-xs'
                      : 'border rounded-tl-xs'
                  }`}
                  style={
                    !isUser
                      ? {
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                        }
                      : {}
                  }
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 self-start p-2">
              <RefreshCw size={12} className="animate-spin text-[#0a66c2]" />
              <span>Coach is analyzing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div
          className="px-3 py-2 border-t flex flex-wrap gap-1.5"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="w-full text-[10px] text-gray-400 font-semibold mb-0.5">Quick Prompts:</div>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-full border text-left text-gray-600 dark:text-gray-300 hover:text-[#0a66c2] hover:border-[#0a66c2] hover:bg-blue-500/5 transition cursor-pointer disabled:opacity-50"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className="p-3 border-t flex items-center gap-2"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about resume, interview, or roles..."
            className="flex-1 px-3.5 py-2 rounded-full border text-xs focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-2 rounded-full bg-[#0a66c2] text-white hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer shadow"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiCoachDrawer;
