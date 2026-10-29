import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginComp = (props) => {
  const navigate = useNavigate();

  const handleOnSucess = async (credResponse) => {
    try {
      const token = credResponse.credential;
      const res = await axios.post(
        'http://localhost:4000/api/auth/google',
        { token },
        { withCredentials: true }
      );

      localStorage.setItem('isLogin', 'true');
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('userUpdated'));

      if (res.data?.isNewUser && res.data?.googlePicture) {
        sessionStorage.setItem('pendingGoogleAvatar', res.data.googlePicture);
      }

      props.changeLoginValue(true);
      navigate('/feeds');
    } catch (err) {
      console.error("Google Auth Error:", err);
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={(credentialResponse) => handleOnSucess(credentialResponse)}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
};

export default GoogleLoginComp;