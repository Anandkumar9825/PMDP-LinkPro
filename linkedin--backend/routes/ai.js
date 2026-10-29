const express = require('express');
const { 
    generatePost, 
    generateCommentSuggestions, 
    parseResume, 
    analyzeResume,
    matchJobRole,
    enhanceBulletPoint,
    generateCoverLetter,
    sendCoverLetterEmail,
    getConversations, 
    getConversation, 
    sendMessage, 
    deleteConversation 
} = require('../controller/ai');
const router = express.Router();

// FEATURE 1: AI Post & Article Generator
router.post('/generate-post', generatePost);

// FEATURE 2: AI Smart Comment Suggestions
router.post('/comment-suggestions', generateCommentSuggestions);

// FEATURE 3: AI Resume & ATS Analyzer
router.post('/analyze-resume', analyzeResume);
router.post('/evaluate', analyzeResume); // Alias matching documentation spec

// FEATURE 4: AI Job Role & Opportunity Matching
router.post('/match-job', matchJobRole);
router.post('/match', matchJobRole); // Alias matching documentation spec

// FEATURE 5: AI Bullet Point Enhancer (STAR Framework)
router.post('/enhance-bullet', enhanceBulletPoint);

// FEATURE 6: AI Cover Letter & Cold Outreach Generator
router.post('/generate-cover-letter', generateCoverLetter);
router.post('/send-cover-letter', sendCoverLetterEmail);

// FEATURE 7: AI Resume Parser & Profile Auto-Fill
router.post('/parse-resume', parseResume);

// FEATURE 8: AI Career Coach Chatbot
router.get('/reviewer/conversations', getConversations);
router.get('/reviewer/conversations/:conversationId', getConversation);
router.post('/reviewer/conversations/:conversationId/messages', sendMessage);
router.delete('/reviewer/conversations/:conversationId', deleteConversation);

module.exports = router;
