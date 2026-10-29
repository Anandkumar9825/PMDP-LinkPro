const fs = require('fs');
let content = fs.readFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--backend/controller/post.js');

const searchString = 'exports.deletePost =';
let searchIdx = content.indexOf(searchString);

if (searchIdx !== -1) {
    const endString = '};';
    let endIdx = content.indexOf(endString, searchIdx);
    
    if (endIdx !== -1) {
        let cleanBuffer = content.slice(0, endIdx + 2);
        fs.writeFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--backend/controller/post.js', cleanBuffer);
        
        const newAddition = `

// To Save/Unsave Post
exports.toggleSavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const User = require('../models/user');
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const isSaved = user.savedPosts.includes(postId);
        if (isSaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
        } else {
            user.savedPosts.push(postId);
        }

        await user.save();
        return res.status(200).json({ message: isSaved ? 'Post unsaved.' : 'Post saved.', savedPosts: user.savedPosts });
    } catch (err) {
        console.error('Save post error:', err);
        res.status(500).json({ error: 'Server Error.' });
    }
};

// To Get Saved Posts
exports.getSavedPosts = async (req, res) => {
    try {
        const User = require('../models/user');
        const user = await User.findById(req.user._id).populate({
            path: 'savedPosts',
            populate: { path: 'user', select: '-password' }
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const validSavedPosts = user.savedPosts.filter(post => post != null);
        
        return res.status(200).json({ message: 'Saved posts fetched.', posts: validSavedPosts });
    } catch (err) {
        console.error('Get saved posts error:', err);
        res.status(500).json({ error: 'Server Error.' });
    }
};
`;
        fs.appendFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--backend/controller/post.js', newAddition, 'utf8');
        console.log('Fixed successfully');
    }
}
