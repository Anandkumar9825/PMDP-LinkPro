import React, { useState, useEffect } from 'react';
import Card from '../Card/card';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Advertisement = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(currentUser || null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                setUserData(JSON.parse(stored));
            } else if (currentUser) {
                setUserData(currentUser);
            }
        } catch (e) {
            setUserData(currentUser);
        }
    }, [currentUser]);

    const coverPic = userData?.cover_pic || userData?.bgPic || userData?.coverPic || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80';
    const profilePic = userData?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const name = userData?.f_name || 'Professional';
    const headline = userData?.headline || 'LinkPro Member';

    return (
        <div className='sticky top-20 w-full'>
            <Card padding={0} className="shadow-xs overflow-hidden">
                {/* Header Cover Banner */}
                <div className='relative h-20 w-full overflow-hidden bg-slate-800'>
                    <img
                        src={coverPic}
                        alt="Cover Banner"
                        className='h-full w-full object-cover'
                    />
                    <div className='absolute inset-0 bg-black/10' />
                </div>

                {/* Overlapping Avatar */}
                <div className='relative px-4 pb-5 pt-0 text-center'>
                    <div className='-mt-10 mb-2 flex justify-center'>
                        <img
                            src={profilePic}
                            alt={name}
                            className='rounded-full ring-3 ring-[var(--bg-card)] h-16 w-16 object-cover shadow-sm'
                        />
                    </div>

                    <div className='text-sm font-bold truncate' style={{ color: 'var(--text-primary)' }}>
                        {name}
                    </div>
                    <div className='text-xs mt-0.5 truncate' style={{ color: 'var(--text-secondary)' }}>
                        {headline}
                    </div>

                    <div className='mt-3 pt-3 border-t text-xs leading-relaxed text-gray-500' style={{ borderColor: 'var(--border-color)' }}>
                        Stay connected with industry peers and explore recommended career paths.
                    </div>

                    <Link
                        to="/resume"
                        className='mt-3 w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#0a66c2] hover:bg-[#004182] text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer'
                    >
                        <Sparkles size={14} />
                        <span>Explore Jobs</span>
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Advertisement;