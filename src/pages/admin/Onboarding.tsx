//File: src/pages/admin/Onboarding.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/common/RootStoreContext';
import { ApiKey, ICompany } from '../../store/models/Company';
import { types } from 'mobx-state-tree';
import { Identifier } from '../../store/models/Assistant';
import { LOCALSTORAGE_COMPANY_ID, LOCALSTORAGE_USER_ID, createSession, getSessionById, setLocalStorageItem } from '../../services/api/sessionService';
import { IUser, User } from '../../store/models/User';

const OnboardingPage: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const rootStore = useRootStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = location.state as { user: any };


    const handleSignup = async () => {
        try {
            // Create new company for user with default values
            const defaultCompany = {
                name: `${user.given_name} Default Company`,
                api_keys: [
                    { key: 'openai_api_key', value: 'defaultValue' },
                    { key: 'gcp_key', value: 'defaultValue' },
                    { key: 'labs11_api_key', value: 'defaultValue' },
                    { key: 'twilio_account_sid', value: 'defaultValue' },
                    { key: 'twilio_auth_token', value: 'defaultValue' }
                ],
                identifiers: [
                    { key: 'email', value: user.email }
                ],
                __v: 0
            };
            const newCompany = await rootStore.addCompany(defaultCompany as ICompany);
            setLocalStorageItem(LOCALSTORAGE_COMPANY_ID, newCompany._id);

            // Create new user
            const newUser = {
                name: user.name,
                email: user.email,
                googleId: user.sub,
                role: 'CompanyUser',
                companyId: newCompany._id,
                identifiers: [
                    { key: 'email', value: user.email }
                ]
            } as IUser;

            // Add new user to the rootStore
            const res = await rootStore.addUser(newUser);
            const mobxUser = User.create(res);
            rootStore.setCurrentUser(mobxUser);
            setLocalStorageItem(LOCALSTORAGE_USER_ID, res._id);


            //create new session and set the new company as the active company
            const session = await createSession(
                res._id,
                newCompany._id
            );
            const sessionData = await getSessionById(session._id);
            rootStore.sessionStore.setActiveSession(sessionData);
            localStorage.setItem('userToken', 'new session');


            await rootStore.loadUsers();
            rootStore.sessionStore.loadSessions();
            await rootStore.loadCompanies();

            // finish onboarding
            await rootStore.completeOnboarding();
            navigate('/admin/users');
        } catch (error) {
            console.error('Error during signup and company creation:', error);
        }
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
