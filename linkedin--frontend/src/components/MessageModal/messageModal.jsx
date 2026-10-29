import React, { useState } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'    // Import Toastify for Error Notification.

const MessageModal = ({ selfData, userData }) => {

    const [message, setMessage] = useState('')

    const handleSendMessage = async () => {
        await axios.post('http://localhost:4000/api/conversation/add-conversation', { recieverId: userData?._id, message }, { withCredentials: true }).then(res => {
            toast.success(res.data.message);
            setTimeout(() => {
                window.location.reload();
            }, 2000)
            //window.location.reload();
        }).catch(err => {
            console.log(err);
            alert(err?.response?.data?.error)
        })
    }
    return (
        <div className='my-5'>
            <div className='w-full mb-4'>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className='p-2 mt-1 w-full border-1 rounded-md' placeholder='Enter Message' cols={10} rows={10}></textarea>
            </div>
            <div onClick={handleSendMessage} className='bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl'>Send</div>
            <ToastContainer position="top-right" style={{ zIndex: 9999, marginTop: "70px" }} />
        </div>
    )
}

export default MessageModal