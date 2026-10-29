const fs = require('fs');
let content = fs.readFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--frontend/src/components/Post/post.jsx', 'utf8');

// 1. Replace useState initialization
content = content.replace(
    'const [isSaved, setIsSaved] = useState(false);',
    'const [isSaved, setIsSaved] = useState(() => {\n    if (!activeUser?.savedPosts) return false;\n    return activeUser.savedPosts.some(id => id.toString() === item?._id?.toString() || (id._id && id._id.toString() === item?._id?.toString()));\n  });'
);

// 2. Add handleSavePost function before handleShare
const handleShareStr = '  // Share action with DB persistence & clipboard copy';
const savePostFunc = `
  const handleSavePost = async () => {
    try {
      setIsSaved(!isSaved);
      const res = await axios.post(\`http://localhost:4000/api/post/save/\${item._id}\`, {}, { withCredentials: true });
      if (activeUser) {
          activeUser.savedPosts = res.data.savedPosts;
      }
      toast.success(res.data.message || (isSaved ? 'Removed from saved items' : 'Post saved!'));
    } catch (err) {
      setIsSaved(isSaved);
      toast.error('Failed to save post');
    }
  };

`;
content = content.replace(handleShareStr, savePostFunc + handleShareStr);

// 3. Update onClick to use handleSavePost
const oldSaveOnClick = `                <button
                  onClick={() => {
                    setIsSaved(!isSaved);
                    setMenuOpen(false);
                    toast.success(isSaved ? 'Removed from saved items' : 'Post saved!');
                  }}`;
const newSaveOnClick = `                <button
                  onClick={() => {
                    handleSavePost();
                    setMenuOpen(false);
                  }}`;
content = content.replace(oldSaveOnClick, newSaveOnClick);

fs.writeFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--frontend/src/components/Post/post.jsx', content);
