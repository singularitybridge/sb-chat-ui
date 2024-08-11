//File: src/pages/admin/Onboarding.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { User } from '../../store/models/User';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import Button from '../../components/sb-core-ui-kit/Button';
import { Input } from '../../components/sb-core-ui-kit/Input';
import { Textarea } from '../../components/sb-core-ui-kit/Textarea';
import apiClient from '../../services/AxiosService';
import { Identifier } from '../../store/models/Assistant';
import { OnboardingStatus } from '../../store/models/RootStore';

const OnboardingDialog: React.FC = observer(() => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const mapServerResponseToUserModel = async (serverResponse: any) => {
    const newUser = await User.create({
      _id: serverResponse._id,
      name: serverResponse.name,
      nickname: '',
      email: serverResponse.email,
      googleId: serverResponse.googleId || '',
      role: serverResponse.role,
      companyId: serverResponse.companyId, 
      identifiers: serverResponse.identifiers.map((identifier: any) => Identifier.create({
        key: identifier.key,
        value: identifier.value,
        _id: identifier._id,
      }))
    });
    return newUser;
  };

  const handleOnboarding = async () => {
    try {
      const response = await apiClient.post('onboarding', { current_user: rootStore.currentUser, name, description });
      
      const { user, company, token } = response.data;
      
      localStorage.setItem('userToken', token);

      const userModelInstance = await mapServerResponseToUserModel(user);
      rootStore.setCurrentUser(userModelInstance);

      rootStore.updateOnboardingStatus(OnboardingStatus.USING_BASIC_FEATURES, []);
      rootStore.sessionStore.closeDialog();
      navigate('/admin/users');
    } catch (error) {
      console.error('Error during onboarding:', error);
    }
  };

  return (
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
        <Button onClick={handleOnboarding} isArrowButton={true} disabled={description === '' || name === ''}>
          כניסה למערכת
        </Button>
      </div>
    </div>
  );
});

export default OnboardingDialog;
