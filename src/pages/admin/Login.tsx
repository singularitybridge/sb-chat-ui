import React from 'react';
import  { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const clientId = '836003625529-l01g4b1iuhc0s1i7o33ms9qelgmghcmh.apps.googleusercontent.com';

interface UserData {
    name: string;
    email: string;
    [key: string]: any;
}


const Login: React.FC = () => {
    const onSuccess = async (res: any) => { // Assuming 'res' will have a property 'credential'
        const user: UserData | null = jwtDecode<UserData>(res.credential);
        console.log('User data:', user);

        const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: res.credential }),
        });

        if (response.ok) {
            console.log('Token verified!');
        } else {
            console.error('Token verification failed');
        }
    };

    const onError = (error: any) => {
        console.error('Login failed:', error);
    };

    return <GoogleLogin onSuccess={onSuccess} onError={()=>onError} />;
};


export default Login;
