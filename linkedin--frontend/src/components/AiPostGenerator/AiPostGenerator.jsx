import React, { useState } from 'react';
import axios from 'axios';

const AiPostGenerator = ({ currentText, setPostText }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [style, setStyle] = useState('Professional');
  
  const [originalDraft, setOriginalDraft] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [variationCount, setVariationCount] = useState(0);

  const handleGenerate = async (nextIndex = null) => {
    const textToUse = (originalDraft || currentText || '').trim();
    if (!textToUse) {
      setErrorMsg("Please enter some content before using AI.");
      return;
    }
    
    setErrorMsg(null);
    setLoading(true);

    const targetIndex = nextIndex !== null ? nextIndex : variationCount;
    
    try {
      const response = await axios.post('http://localhost:4000/api/ai/generate-post', {
        prompt: textToUse,
        isRewrite: true,
        style: style,
        variationIndex: targetIndex,
        variationId: Date.now()
      }, { withCredentials: true, timeout: 300000 }); 
      
      const generatedText = response.data?.data?.content || response.data?.text || '';
      
      if (generatedText) {
        if (!originalDraft) setOriginalDraft(currentText);
        setGeneratedDraft(generatedText);
        setVariationCount(targetIndex + 1);
        setShowCompare(true);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "We could not generate content right now.";
      setErrorMsg(error.code === 'ECONNABORTED' ? "The AI service is taking too long. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeepCurrent = () => {
    setShowCompare(false);
    setVariationCount(0);
    setOriginalDraft('');
  };

  const handleUseGenerated = () => {
    setPostText(generatedDraft);
    setShowCompare(false);
    setVariationCount(0);
    setOriginalDraft('');
  };

  return (
    <div className="flex flex-col gap-2 mb-4 w-full">
      
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm flex justify-between items-center dark:bg-red-900/30 dark:text-red-300">
          <span>{errorMsg}</span>
          <button onClick={() => handleGenerate(variationCount)} className="font-bold hover:underline">Retry</button>
        </div>
      )}

      {!showCompare ? (
        <div className="flex gap-2 items-center flex-wrap">
          <select 
            value={style} 
            onChange={(e) => setStyle(e.target.value)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200"
          >
            <option value="Professional" className="dark:bg-slate-800">Professional</option>
            <option value="Academic" className="dark:bg-slate-800">Academic</option>
            <option value="Casual" className="dark:bg-slate-800">Casual</option>
            <option value="Storytelling" className="dark:bg-slate-800">Storytelling</option>
            <option value="Concise" className="dark:bg-slate-800">Concise</option>
            <option value="Inspirational" className="dark:bg-slate-800">Inspirational</option>
          </select>

          <button 
            type="button"
            onClick={() => handleGenerate(0)} 
            disabled={loading}
            className={`px-4 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-full text-sm font-semibold transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {loading ? 'Generating...' : '✨ Generate Something Different'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900/50">
          <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              🔍 Compare Versions <span className="text-xs text-gray-400 font-normal">(Version {variationCount || 1})</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={handleKeepCurrent} className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Keep Current Draft</button>
              <button onClick={handleUseGenerated} className="px-3 py-1 bg-[#0a66c2] text-white rounded-full text-xs font-medium hover:bg-[#004182]">Use Generated Version</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-700 max-h-[50vh] overflow-y-auto">
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Original Draft</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{originalDraft}</p>
            </div>
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="text-xs font-semibold text-[#0a66c2] uppercase tracking-wider mb-2">New Version</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{generatedDraft}</p>
            </div>
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <span className="text-xs text-gray-500 font-medium">Style:</span>
               <select 
                 value={style} 
                 onChange={(e) => setStyle(e.target.value)}
                 disabled={loading}
                 className="px-2 py-1 rounded text-xs border border-gray-300 bg-white text-gray-800 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200"
               >
                 <option value="Professional">Professional</option>
                 <option value="Academic">Academic</option>
                 <option value="Casual">Casual</option>
                 <option value="Storytelling">Storytelling</option>
                 <option value="Concise">Concise</option>
                 <option value="Inspirational">Inspirational</option>
               </select>
             </div>
             <button 
               type="button"
               onClick={() => handleGenerate(variationCount)} 
               disabled={loading} 
               className="px-3 py-1 text-xs text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full font-semibold transition-colors flex items-center gap-1 shadow-sm"
             >
               {loading ? 'Generating...' : '✨ Try Another Version'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPostGenerator;
