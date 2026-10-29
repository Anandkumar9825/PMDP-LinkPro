import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Briefcase, Building2, MapPin, Calendar, FileText, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Styled confirmation dialog component
const DeleteConfirmDialog = ({ onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

        {/* Dialog */}
        <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
            <div className="flex flex-col items-center text-center gap-4">
                {/* Warning Icon */}
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-red-500" />
                </div>

                <div>
                    <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Delete Experience
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Are you sure you want to delete this experience? This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-3 w-full pt-1">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-full border text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        <Trash2 size={14} />
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const ExpModal = ({ handleEditFunc, selfData, updateExp, setUpdateExp, closeModal }) => {
    const isEditing = Boolean(updateExp?.clicked && updateExp?.data?._id);
    const { updateCurrentUser } = useAuth();

    const [data, setData] = useState({
        designation: isEditing ? (updateExp.data.designation || '') : '',
        company_name: isEditing ? (updateExp.data.company_name || '') : '',
        location: isEditing ? (updateExp.data.location || '') : '',
        startDate: isEditing ? (updateExp.data.startDate || '') : '',
        endDate: isEditing ? (updateExp.data.endDate || '') : '',
        isCurrent: isEditing ? Boolean(updateExp.data.isCurrent) : false,
        description: isEditing ? (updateExp.data.description || '') : '',
        duration: isEditing ? (updateExp.data.duration || '') : ''
    });

    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const onChangeHandle = (e, key) => {
        setData(prev => ({ ...prev, [key]: e.target.value }));
    };

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setData(prev => ({
            ...prev,
            isCurrent: checked,
            endDate: checked ? '' : prev.endDate
        }));
    };

    const syncUserState = async (updatedUser) => {
        if (updatedUser) {
            await updateCurrentUser(updatedUser);
            if (handleEditFunc) handleEditFunc(updatedUser);
        }
    };

    const handleOnSave = async (e) => {
        if (e) e.preventDefault();

        if (!data.designation.trim()) {
            return toast.error('Please enter a Title / Role.');
        }
        if (!data.company_name.trim()) {
            return toast.error('Please enter a Company Name.');
        }

        // Auto-calculate formatted duration if start date is provided
        let formattedDuration = data.duration;
        if (data.startDate) {
            formattedDuration = `${data.startDate} - ${data.isCurrent ? 'Present' : (data.endDate || 'Present')}`;
        }

        const payload = {
            ...data,
            duration: formattedDuration
        };

        try {
            setLoading(true);
            let res;

            if (isEditing) {
                res = await axios.put(
                    `http://localhost:4000/api/users/experience/${updateExp.data._id}`,
                    payload,
                    { withCredentials: true }
                );
                toast.success('Experience updated successfully!');
            } else {
                res = await axios.post(
                    'http://localhost:4000/api/users/experience',
                    payload,
                    { withCredentials: true }
                );
                toast.success('Experience added successfully!');
            }

            await syncUserState(res.data?.user);

            if (setUpdateExp) setUpdateExp({ clicked: false, id: '', data: {} });
            if (closeModal) closeModal();
        } catch (err) {
            console.error('Save experience error:', err);
            toast.error(err?.response?.data?.error || 'Failed to save experience');
        } finally {
            setLoading(false);
        }
    };

    const handleOnDelete = async () => {
        try {
            setLoading(true);
            const res = await axios.delete(
                `http://localhost:4000/api/users/experience/${updateExp.data._id}`,
                { withCredentials: true }
            );

            toast.success('Experience deleted successfully!');
            await syncUserState(res.data?.user);

            if (setUpdateExp) setUpdateExp({ clicked: false, id: '', data: {} });
            if (closeModal) closeModal();
        } catch (err) {
            console.error('Delete experience error:', err);
            toast.error(err?.response?.data?.error || 'Failed to delete experience');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            {/* Styled Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <DeleteConfirmDialog
                    onConfirm={handleOnDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                    loading={loading}
                />
            )}

            <form onSubmit={handleOnSave} className='mt-2 space-y-4 max-h-[520px] overflow-y-auto pr-1'>
                {/* Title / Role */}
                <div>
                    <label className='block text-xs font-bold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                        Title / Role <span className='text-red-500'>*</span>
                    </label>
                    <div
                        className='flex items-center gap-2 px-3.5 py-2.5 rounded-xl border focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 transition-all'
                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    >
                        <Briefcase size={16} className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={data.designation}
                            onChange={(e) => onChangeHandle(e, 'designation')}
                            placeholder='e.g., Senior Software Engineer'
                            className='w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400'
                            style={{ color: 'var(--text-primary)' }}
                            required
                        />
                    </div>
                </div>

                {/* Company Name */}
                <div>
                    <label className='block text-xs font-bold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                        Company <span className='text-red-500'>*</span>
                    </label>
                    <div
                        className='flex items-center gap-2 px-3.5 py-2.5 rounded-xl border focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 transition-all'
                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    >
                        <Building2 size={16} className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={data.company_name}
                            onChange={(e) => onChangeHandle(e, 'company_name')}
                            placeholder='e.g., Google, Microsoft'
                            className='w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400'
                            style={{ color: 'var(--text-primary)' }}
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className='block text-xs font-bold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                        Location
                    </label>
                    <div
                        className='flex items-center gap-2 px-3.5 py-2.5 rounded-xl border focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 transition-all'
                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    >
                        <MapPin size={16} className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={data.location}
                            onChange={(e) => onChangeHandle(e, 'location')}
                            placeholder='e.g., San Francisco, CA / Remote'
                            className='w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400'
                            style={{ color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                {/* Currently Working Checkbox */}
                <div className='flex items-center gap-2.5 pt-1'>
                    <input
                        type='checkbox'
                        id='isCurrentExp'
                        checked={data.isCurrent}
                        onChange={handleCheckboxChange}
                        className='w-4 h-4 rounded accent-[#0a66c2] cursor-pointer'
                    />
                    <label htmlFor='isCurrentExp' className='text-xs font-semibold select-none cursor-pointer' style={{ color: 'var(--text-primary)' }}>
                        I am currently working in this role
                    </label>
                </div>

                {/* Start Date & End Date */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-xs font-bold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                            Start Date
                        </label>
                        <div
                            className='flex items-center gap-2 px-3.5 py-2.5 rounded-xl border focus-within:border-[#0a66c2] transition-all'
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                        >
                            <Calendar size={16} className='text-gray-400 shrink-0' />
                            <input
                                type='text'
                                value={data.startDate}
                                onChange={(e) => onChangeHandle(e, 'startDate')}
                                placeholder='e.g., Jan 2022'
                                className='w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400'
                                style={{ color: 'var(--text-primary)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-xs font-bold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                            End Date
                        </label>
                        <div
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${data.isCurrent ? 'opacity-40' : 'focus-within:border-[#0a66c2]'}`}
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                        >
                            <Calendar size={16} className='text-gray-400 shrink-0' />
                            <input
                                type='text'
                                value={data.isCurrent ? 'Present' : data.endDate}
                                onChange={(e) => onChangeHandle(e, 'endDate')}
                                disabled={data.isCurrent}
                                placeholder='e.g., Dec 2024'
                                className='w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed'
                                style={{ color: 'var(--text-primary)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className='block text-xs font-bold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                        Description
                    </label>
                    <div
                        className='flex gap-2 p-3 rounded-xl border focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 transition-all'
                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    >
                        <FileText size={16} className='text-gray-400 mt-1 shrink-0' />
                        <textarea
                            value={data.description}
                            onChange={(e) => onChangeHandle(e, 'description')}
                            rows={3}
                            placeholder='Describe your responsibilities, key achievements, and skills used...'
                            className='w-full bg-transparent text-xs sm:text-sm outline-none resize-none placeholder:text-gray-400'
                            style={{ color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                {/* Modal Actions */}
                <div className='flex items-center justify-between pt-4 border-t' style={{ borderColor: 'var(--border-color)' }}>
                    {isEditing ? (
                        <button
                            type='button'
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                            className='flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-all cursor-pointer disabled:opacity-50'
                        >
                            <Trash2 size={15} />
                            <span>Delete</span>
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        type='submit'
                        disabled={loading}
                        className='flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer'
                    >
                        <Check size={15} />
                        <span>{loading ? 'Saving...' : isEditing ? 'Update Experience' : 'Save Experience'}</span>
                    </button>
                </div>
            </form>
        </>
    );
};

export default ExpModal;
