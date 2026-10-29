import React, { useEffect, useState } from 'react'
import ProfileCard from '../../components/ProfileCard/profileCard'
import Advertisement from '../../components/Advertisement/advertisement'
import { useParams } from 'react-router-dom'
import Card from '../../components/Card/card'
import Post from '../../components/Post/post'
import axios from 'axios';

const AllActivities = () => {

    const { id } = useParams();

    const [post, setPosts] = useState([])
    const [ownData, setOwnData] = useState(null)

    const fetchDataOnLoad = async () => {
        await axios.get(`http://localhost:4000/api/post/getAllPostForUser/${id}`).then(res => {
            setPosts(res.data.posts)
        }).catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        fetchDataOnLoad()
        let userData = localStorage.getItem('userInfo')
        setOwnData(userData ? JSON.parse(userData) : null)
    }, [id])

    return (
        <div className='min-h-screen px-5 xl:px-50 py-5 flex gap-5 w-full mt-5 transition-colors duration-300'>

            {/* Left Side */}
            <div className='w-[21%] sm:block sm:w-[23%] hidden py-5'>
                <div className='h-fit sticky top-19'>
                    <ProfileCard data={post[0]?.user} />
                </div>
            </div>

            {/* Middle Side */}
            <div className='w-[100%] py-5 sm:w-[50%]'>
                <Card padding={1}>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='text-xl font-bold' style={{ color: 'var(--text-primary)' }}>All Activity</div>
                        <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0a66c2]'>
                            {post.length} {post.length === 1 ? 'Post' : 'Posts'}
                        </span>
                    </div>
                    <div className='w-fit px-4 py-1.5 rounded-full bg-[#0a66c2] my-3 text-white text-sm font-semibold'>Posts</div>

                    {post.length > 0 ? (
                        <div className='flex flex-col gap-4'>
                            {post.map((item, index) => (
                                <div key={index}>
                                    <Post item={item} personalData={ownData} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-10 text-center text-sm text-gray-400'>No posts yet.</div>
                    )}
                </Card>
            </div>

            {/* Right Side */}
            <div className='w-[26%] py-5 hidden md:block'>
                <div className='my-5 sticky top-19'>
                    <Advertisement />
                </div>
            </div>
        </div>
    )
}

export default AllActivities