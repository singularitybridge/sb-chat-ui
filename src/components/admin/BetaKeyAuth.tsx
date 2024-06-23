import React, { useState } from 'react';
import { verifyBetaKey } from '../../services/api/authService';

interface BetaKeyAuthProps {
    onSuccess: () => void;
}

const BetaKeyAuth: React.FC<BetaKeyAuthProps> = ({ onSuccess }) => {
    const [betaKey, setBetaKey] = useState('');
    const [error, setError] = useState('');

    const handleBetaKeySubmit = async () => {
        try {            
            const response = await verifyBetaKey(betaKey);
            if (response.isValid) {
                onSuccess();
            } else {
                setError('Invalid beta key. Please try again.');
            }
        } catch (error) {
            setError('Error verifying beta key. Please try again later.');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleBetaKeySubmit();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-10">Join Our Closed Beta</h1>
                <p className="text-center mb-8">
                    We're currently open to closed beta users only. Please enter your beta invite key to sign up.
                </p>
                <input
                    type="text"
                    value={betaKey}
                    onChange={(e) => setBetaKey(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your invite key"
                    className="mb-10 p-2 border rounded w-full"
                />
                {error && <p className="text-red-500 mb-6 text-center">{error}</p>}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleBetaKeySubmit}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetaKeyAuth;
