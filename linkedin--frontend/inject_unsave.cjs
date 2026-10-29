const fs = require('fs');
let content = fs.readFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--frontend/src/pages/Profile/Profile.jsx', 'utf8');

const marker = '    const handleMessageModal = () => {';
const injection = `    const handleUnsavePost = async (e, postId) => {
        e.stopPropagation();
        try {
            setSavedPosts(prev => prev.filter(p => p._id !== postId));
            await axios.post('http://localhost:4000/api/post/save/' + postId, {}, { withCredentials: true });
            toast.success('Post removed from saved items');
        } catch (err) {
            toast.error('Failed to unsave post');
        }
    };

`;

content = content.replace(marker, injection + marker);
fs.writeFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--frontend/src/pages/Profile/Profile.jsx', content);
console.log('Done');
