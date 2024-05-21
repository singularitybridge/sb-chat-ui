import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/common/RootStoreContext';

const OnboardingPage: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const rootStore = useRootStore();
    const navigate = useNavigate();

    const handleSignup = () => {
        // Handle the signup logic here
        rootStore.completeOnboarding();
        navigate('/admin/users');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-4">Join Singularity Bridge AI Agent Portal</h1>
                <p className="text-center mb-6">
                    Welcome to our cutting-edge AI system, designed to revolutionize the way you interact with technology.
                    Our portal offers a seamless experience, combining advanced artificial intelligence with intuitive user interfaces.
                </p>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="description">Tell us about yourself</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What do you do?"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={handleSignup}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
