import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'    // Import Toastify for Error Notification.

const AboutModal = ({ handleEditFunc, selfData }) => {

    const [data, setData] = useState({ about: selfData?.about, skillInp: selfData?.skills?.join(','), resume: selfData?.resume })
    const [loading, setLoading] = useState(false)


    const onChangeHandle = (event, key) => {
        setData({ ...data, [key]: event.target.value })
    }

    const handleInputImage = async (e) => {
        const files = e.target.files;
        const data = new FormData();
        data.append('file', files[0]);

        data.append('upload_preset', 'linkedInClone');
        setLoading(true)

        try {
            const response = await axios.post("https://api.cloudinary.com/v1_1/dmnhbiouy/image/upload", data)
            const imageUrl = response.data.url;
            setData({...data, resume:imageUrl})

        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleOnSave = async () => {
        let arr = data?.skillInp?.split(',');

        let newData = { ...selfData, about: data.about, skills: arr, resume: data.resume };
        handleEditFunc(newData);

        toast.success("Data Updated Successfully")
        setTimeout(() => {
            window.location.reload();
        }, 2000)
    }

    // const [data, setData] = useState({
    //     about: "",
    //     skills: ""
    // });
    // const [errorMessage, setErrorMessage] = useState({
    //     about: "",
    //     skills: ""
    // });
    // const [resumeFile, setResumeFile] = useState(null);
    // const [fileName, setFileName] = useState("djkfjkadhfkadfhkfh");

    // const ValidateForm = () => {
    //     const errors = {};

    //     // About validation
    //     if(!data.about.trim()) {
    //         errors.about = "About section is required";
    //     } else if(data.about.trim().length < 10) {
    //         errors.about = "About must be at least 10 characters long";
    //     }

    //     // Skills validation
    //     if(!data.skills.trim()) {
    //         errors.skills = "Skills are required";
    //     } else {
    //         const skillsArray = data.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    //         if(skillsArray.length === 0) {
    //             errors.skills = "Add at least one skill (separated by commas)";
    //         } else if(skillsArray.length > 15) {
    //             errors.skills = "Maximum 10 skills allowed";
    //         }
    //     }

    //     // Only set errors if there ARE errors
    //     if(Object.keys(errors).length > 0) {
    //         setErrorMessage(errors);
    //         console.log("Validation errors:", errors);
    //         return false;
    //     } else {
    //         setErrorMessage({ about: "", skills: "" });
    //         //console.log("No validation errors - form is perfect!");
    //         return true;
    //     }
    // }

    // const FormSubmit = (e) => {
    //     e.preventDefault();
    //     if(ValidateForm()) {
    //         const formData = {
    //             about: data.about.trim(),
    //             skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
    //             resumeFile: resumeFile ? resumeFile.name : null
    //         };

    //         console.log("Updated About Details:", formData);
    //         setData({ about: "", skills: "" });
    //         setResumeFile(null);
    //         setFileName("djkfjkadhfkadfhkfh");
    //         return;
    //     }
    // }

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setData({ ...data, [name]: value });

    //     if(errorMessage[name]) {
    //         setErrorMessage({
    //             ...errorMessage,
    //             [name]: ""
    //         });
    //     }
    // }

    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if(file) {
    //         // Checking file type
    //         const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    //         if(!allowedTypes.includes(file.type)) {
    //             alert("Please upload PDF or Word documents only");
    //             return;
    //         }
    //         // Checking file size (5MB max)
    //         if(file.size > 5 * 1024 * 1024) {
    //             alert("File size must be less than 5MB");
    //             return;
    //         }
    //         setResumeFile(file);
    //         setFileName(file.name);
    //     }
    // }

    return (
        // <div className='my-8'>
        <div className='mt-8 w-full h-[350px] overflow-auto'>
            <div className='w-full mb-4'>
                <label>About*</label>
                <br />
                <textarea
                    className='p-2 mt-1 w-full border-1 rounded-md'
                    cols={10}
                    rows={3}
                    placeholder='Tell us about yourself (min 20 characters)'
                    // name='about'
                    // value={data.about}
                    // onChange={handleInputChange}
                    value={ data.about }
                    onChange={(e) => onChangeHandle(e, 'about')}

                />
                {/* {errorMessage.about && <p style={{color: "red", fontSize: "12px", marginTop: "4px"}}>{errorMessage.about}</p>} */}
            </div>

            <div className='w-full mb-4'>
                <label>Skills*(Add by seperating comma)</label>
                <br />
                <textarea
                    className='p-2 mt-1 w-full border-1 rounded-md'
                    cols={10}
                    rows={3}
                    placeholder='React, JavaScript, Python, Django'
                    // name='skills'
                    // value={data.skills}
                    // onChange={handleInputChange}
                    value={ data.skillInp }
                    onChange={(e) => onChangeHandle(e, 'skillInp')}

                />
                {/* {errorMessage.skills && <p style={{color: "red", fontSize: "12px", marginTop: "4px"}}>{errorMessage.skills}</p>} */}
            </div>

            <div className='w-full mb-4'>
                <label htmlFor='resumeUpload' className='p-2 bg-blue-800 text-white rounded-lg cursor-pointer'>Resume Upload</label>
                <input
                    type='file'
                    className='hidden'
                    id='resumeUpload'
                    // accept='.pdf,.doc,.docx'
                    // onChange={handleFileChange}
                    onChange={ handleInputImage }
                />
                {
                    data.resume && <div className='my-2'> { data.resume } </div>
                }
            </div>

            <div
                className='bg-blue-950 text-white w-fit py-1 px-3 cursor-pointer rounded-2xl'
                // onClick={FormSubmit}
                onClick={ handleOnSave }
            >
                Save
            </div>
             <ToastContainer position="top-right" style={{ zIndex: 9999, marginTop: "70px" }} />
        </div>
    )
}

export default AboutModal
