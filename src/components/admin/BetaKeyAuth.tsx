import React, { useState } from 'react';
import { verifyBetaKey } from '../../services/api/authService';
import { TextComponent } from '../sb-core-ui-kit/TextComponent';
import { Input } from '../sb-core-ui-kit/Input';
import Button from '../sb-core-ui-kit/Button';

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
        setError('קוד הזמנה שגוי. נסו שוב.');
      }
    } catch (error) {
      setError('לא הצלחנו לאמת את קוד ההזמנה. נסו שוב מאוחר יותר.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBetaKeySubmit();
    }
  };

  const handleInputChange = (value: string) => {
    setBetaKey(value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="pb-8 w-full max-w-lg">
        <img
          src="assets/sb-welcome.png"
          className="mb-2 mx-auto"
          alt="Welcome"
        />
        <TextComponent
          text="הצטרפו לגרסת הבטא שלנו"
          size="title"
          className="mb-2"
          align="center"
        />
        <TextComponent
          text="אנחנו כרגע נותנים גישה לגרסת הבטא שלנו למשתמשים שנבחרו. בבקשה הכניסו את קוד ההזמנה שקיבלתם."
          size="normal"
          className="mb-6"
          align="center"
        />
        <Input
          id="beta-key"
          type="password"
          value={betaKey}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="הכניסו קוד הזמנה"
          error={error}
        />
        <div className="flex justify-center mt-4">
          <Button onClick={handleBetaKeySubmit} isArrowButton={true}>
            להמשיך
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BetaKeyAuth;