import React, { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Post from '../../components/Post/post';
import TopCourses from '../../components/TopCourses/topCourses';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SingleActivity = () => {
  const { id, postId } = useParams();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const targetCommentId = queryParams.get('commentId');

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/post/getPostById/${postId}`);
      if (res.data?.post) {
        setPost(res.data.post);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  return (
    <main className="min-h-screen px-3 sm:px-6 lg:px-12 xl:px-24 py-6 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Side */}
        <aside className="w-full md:w-[28%] lg:w-[24%] flex-shrink-0">
          <ProfileCard data={post?.user || currentUser} />
        </aside>

        {/* Middle Side Post */}
        <section className="flex-1 w-full max-w-full md:max-w-2xl">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
            </div>
          ) : post ? (
            <Post
              item={post}
              personalData={currentUser}
              defaultOpenComments={true}
              targetCommentId={targetCommentId}
              onPostUpdated={fetchPost}
            />
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              Post not found or has been deleted.
            </div>
          )}
        </section>

        {/* Right Side */}
        <aside className="hidden lg:flex w-[26%] flex-shrink-0 flex-col gap-4">
          <TopCourses />
        </aside>

      </div>
    </main>
  );
};

export default SingleActivity;