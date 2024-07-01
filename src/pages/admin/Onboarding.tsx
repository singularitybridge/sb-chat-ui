//File: src/pages/admin/Onboarding.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/common/RootStoreContext';
import {
  LOCALSTORAGE_COMPANY_ID,
  LOCALSTORAGE_USER_ID,
  createSession,
  getSessionById,
  setLocalStorageItem,
} from '../../services/api/sessionService';
import { IUser, User } from '../../store/models/User';
import { ICompany } from '../../store/models/Company';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import Button from '../../components/sb-core-ui-kit/Button';
import { Input } from '../../components/sb-core-ui-kit/Input';
import { Textarea } from '../../components/sb-core-ui-kit/Textarea';


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
          { key: 'twilio_auth_token', value: 'defaultValue' },
        ],
        identifiers: [{ key: 'email', value: user.email }],
        __v: 0,
      };
      const newCompany = await rootStore.addCompany(defaultCompany as ICompany);
      setLocalStorageItem(LOCALSTORAGE_COMPANY_ID, newCompany._id);
      localStorage.setItem('userToken', newCompany.token);
      // Create new user
      const newUser = {
        name: user.name,
        email: user.email,
        googleId: user.sub,
        role: 'CompanyUser',
        companyId: newCompany._id,
        identifiers: [{ key: 'email', value: user.email }],
      } as IUser;

      // Add new user to the rootStore
      const res = await rootStore.addUser(newUser);
      const mobxUser = User.create(res);
      rootStore.setCurrentUser(mobxUser);
      setLocalStorageItem(LOCALSTORAGE_USER_ID, res._id);

      //create new session and set the new company as the active company
      const session = await createSession(res._id, newCompany._id);
      const sessionData = await getSessionById(session._id);
      rootStore.sessionStore.setActiveSession(sessionData);

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="w-full py-8 px-12">
        <TextComponent
          text="Singularity Bridge"
          size="normal"
          className="font-bold"
          align='right'
        />
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="p-8 w-full max-w-lg">
          <TextComponent
            text="כבר מתחילים ..."
            size="normal"
            className="mb-4"
            color="info"
            align="right"
          />
          <TextComponent
            text="ברוכים הבאים ל Singularity Bridge AI Agent Portal"
            size="title"
            className="mb-4"
            align="right"
          />
          <TextComponent
            text="ברוכים הבאים למערכת המובילה שלנו בתחום המודלים הנוירלים, המיועדת לשנות את הדרך בה אתם מתקשרים עם טכנולוגיה. הפורטל שלנו מציע חוויה חלקה, המשלבת בין טכנולוגיית ניטור מתקדמת לבין ממשקי משתמש אינטואיטיביים."
            size="normal"
            className="mb-10"
            align="right"
          />

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-bold" htmlFor="name">
              שם
            </label>
            <Input
              id="beta-key"
              value={name}
              onChange={setName}
              placeholder="הזינו את שמכם"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-bold" htmlFor="description">
              ספרו לנו על עצמכם
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={setDescription}
              placeholder="ספרו לנו על עצמכם, במה אתם עוסקים?"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSignup} isArrowButton={true} disabled={ description === '' || name === ''}>
              כניסה למערכת
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default OnboardingPage;
