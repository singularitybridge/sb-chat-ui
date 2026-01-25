import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
import { ClipLoader } from 'react-spinners';

const SSOCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // Just redirect - AuthManager will handle the backend auth
    if (isSignedIn) {
      navigate('/admin/assistants');
    } else {
      navigate('/signup');
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-accent">
      <div className="text-center">
        <ClipLoader color="#123abc" loading={true} size={50} />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default SSOCallbackPage;
