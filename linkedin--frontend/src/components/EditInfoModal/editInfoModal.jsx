import React from 'react'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import ResumeParser from '../ResumeParser/ResumeParser'

const EditInfoModal = ({ handleEditFunc, selfData }) => {

    const [data, setData] = useState({ f_name: selfData.f_name, headline: selfData.headline, curr_company: selfData.curr_company, curr_location: selfData.curr_location });

    const onChangeHandle = (event, key) => {
        setData({ ...data, [key]: event.target.value })
    }


    const handleSaveBtn = async () => {
        if (
        data.f_name.trim().length === 0 ||
        data.headline.trim().length === 0 ||
        data.curr_company.trim().length === 0 ||
        data.curr_location.trim().length === 0
        ) {
        return toast.error("Please Fill All Fields.")
        setTimeout(() => {
            window.location.reload();
        }, 2000)
        }
        
        let newData = {...selfData, ...data};
        handleEditFunc(newData)

        toast.success("Data Updated Successfully")
        setTimeout(() => {
            window.location.reload();
        }, 2000)
    }

    // const [data, setData] = useState({
    //     fullName: "",
    //     headline: "",
    //     company: "",
    //     location: ""
    // });
    // const [errorMessage, setErrorMessage] = useState({
    //     fullName: "",
    //     headline: "",
    //     company: "",
    //     location: ""
    // });

    // const ValidateForm = () => {
    //     const nameRegex = /^[a-zA-Z\s]+$/;
    //     const errors = {};

    //     if(!data.fullName) {
    //         errors.fullName = "Full Name is required";
    //     } else if(data.fullName.length < 2) {
    //         errors.fullName = "Full Name must be at least 2 characters";
    //     } else if(!nameRegex.test(data.fullName)) {
    //         errors.fullName = "Full Name should contain only characters";
    //     }

    //     if(!data.headline) {
    //         errors.headline = "Headline is required";
    //     } else if(data.headline.length < 5) {
    //         errors.headline = "Headline must be at least 5 characters";
    //     }

    //     if(!data.company) {
    //         errors.company = "Current Company is required";
    //     } else if(data.company.length < 2) {
    //         errors.company = "Company name must be at least 2 characters";
    //     }

    //     if(!data.location) {
    //         errors.location = "Current Location is required";
    //     } else if(data.location.length < 2) {
    //         errors.location = "Location must be at least 2 characters";
    //     }

    //     // Only set errors if there ARE errors
    //     if(Object.keys(errors).length > 0) {
    //         setErrorMessage(errors);
    //         console.log("Validation errors:", errors);
    //         return false;
    //     } else {
    //         // Clear previous errors when validation passes
    //         setErrorMessage({fullName: "", headline: "", company: "", location: ""});
    //         //console.log("No validation errors - form is perfect!");
    //         return true;
    //     }
    // }

    // const FormSubmit = (e) => {
    //     e.preventDefault();
    //     if(ValidateForm()) {
    //        // console.log("✅ Profile Updated Successfully!");
    //         console.log("User Profile Details:", data);
    //         setData({fullName: "", headline: "", company: "", location: ""});
    //         return;
    //     }
    // }

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;

    //     if(name === 'fullName') {
    //         const onlyLetters = value.replace(/[^a-zA-Z\s]/g, '');
    //         setData({...data, [name]: onlyLetters});
    //     } else {
    //         setData({...data, [name]: value});
    //     }

    //     // Clear specific field error when user types
    //     if(errorMessage[name]) {
    //         setErrorMessage({
    //             ...errorMessage, 
    //             [name]: ""
    //         });
    //     }
    // }

    return (
        <div className='mt-8 w-full h-[350px] overflow-auto'>
            <ResumeParser currentUser={selfData} onUpdateComplete={() => window.location.reload()} />
            <div className='w-full mb-4'>
                <label>Full Name*</label>
                <br />
                <input
                    type='text'
                    className='p-2 mt-1 w-full border-1 rounded-md'
                    placeholder='Enter Full Name'
                    // name='fullName'
                    // value={data.fullName}
                    // onChange={handleInputChange}
                    value={data.f_name}
                    onChange={(e) => { onChangeHandle(e, 'f_name') }}
                />
                {/* {errorMessage.fullName && <p style={{color: "red", fontSize: "12px", marginTop: "4px"}}>{errorMessage.fullName}</p>} */}
            </div>

            <div className='w-full mb-4'>
                <label>Headline*</label>
                <br />
                <textarea
                    className='p-2 mt-1 w-full border-1 rounded-md'
                    cols={10}
                    rows={3}
                    placeholder='Enter your professional headline'
                    // name='headline'
                    // value={data.headline}
                    // onChange={handleInputChange}
                    value={data.headline}
                    onChange={(e) => { onChangeHandle(e, 'headline') }}
                ></textarea>
                {/* {errorMessage.headline && <p style={{color: "red", fontSize: "12px", marginTop: "4px"}}>{errorMessage.headline}</p>} */}
            </div>

            <div className='w-full mb-4'>
                <label>Current Company*</label>
                <br />
                <input
                    type='text'
                    className='p-2 mt-1 w-full border-1 rounded-md'
                    placeholder='Enter Current Company'
                    // name='company'
                    // value={data.company}
                    // onChange={handleInputChange}
                    value={data.curr_company}
                    onChange={(e) => { onChangeHandle(e, 'curr_company') }}
                />
                {/* {errorMessage.company && <p style={{color: "red", fontSize: "12px", marginTop: "4px"}}>{errorMessage.company}</p>} */}
            </div>

            <div className='w-full mb-4'>
                <label>Current Location*</label>
                <br />
                <input
                    type='text'
                    className='p-2 mt-1 w-full border-1 rounded-md'
                    placeholder='Enter Current Location'
                    // name='location'
                    // value={data.location}
                    // onChange={handleInputChange}
                    value={data.curr_location}
                    onChange={(e) => { onChangeHandle(e, 'curr_location') }}
                />
                {/* {errorMessage.location && <p style={{color: "red", fontSize: "12px", marginTop: "4px"}}>{errorMessage.location}</p>} */}
            </div>

            <div
                className='bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl'
                // onClick={FormSubmit}
                onClick={ handleSaveBtn }>
                Save
            </div>
            <ToastContainer position="top-right" style={{ zIndex: 9999, marginTop: "70px" }} />
        </div>
    )
}


export default EditInfoModal
