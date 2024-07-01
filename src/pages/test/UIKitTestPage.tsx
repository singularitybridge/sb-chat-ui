import React, { useEffect, useState } from 'react';
import { Input } from '../../components/sb-core-ui-kit/Input';
import InputWithLabel from '../../components/admin/InputWithLabel';
import Button from '../../components/sb-core-ui-kit/Button';
import { IconButton } from '../../components/admin/IconButton';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';

const UIKitTestPage = () => {

  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');

  const [someText, setSomeText] = useState('');
  const [someOtherText, setSomeOtherText] = useState('');

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'he' : 'en';
  }, [direction]);

  const toggleDirection = (newDirection: 'ltr' | 'rtl') => {
    setDirection(newDirection);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border  border-gray-300 flex items-center justify-center h-[600px]">
          <div className="h-full w-full p-4 space-y-3">
            <TextComponent
              text="זו היא כותרת גדולה"
              size="title"
              color="normal"
            />
            <TextComponent
              text="זו היא כותרת גדולה"
              size="subtitle"
              color="info"
            />
            <TextComponent
              text="זו הוא מלל רגיל, והוא יכול להיות ארוך"
              size="normal"
            />
            <TextComponent
              text="זו הוא מלל קטן, שימושי במקרים של כפתורים וכדומה"
              size="small"
            />
            <TextComponent
              text="זו הוא מלל קטן, שימושי במקרים של כפתורים וכדומה"
              size="small"
              color="alert"
            />
            <TextComponent
              text="זו הוא מלל קטן, שימושי במקרים של כפתורים וכדומה"
              size="small"
              color="info"
            />
            <TextComponent
              text="זהו מלל ממורכז למרכז"
              size="small"
              align="center"
            />
          </div>
        </div>
        <div className="border border-gray-300 flex items-center justify-center h-[600px]">
          <div className="h-full w-full p-4 space-y-3">

            <Input
              id="beta-key"              
              value={someText}
              onChange={setSomeText}              
              placeholder="כתבו כאן משהו"
            />
            <Input
              id="beta-key"              
              value={someOtherText}
              onChange={setSomeOtherText}              
              placeholder="כתבו כאן משהו"
            />
            <Input
              id="beta-key-disabled"              
              value={someText}
              onChange={setSomeText}              
              placeholder="כתבו כאן משהו"
              disabled={true}
            />
            <Input
              id="beta-key-disabled"              
              value={someText}
              onChange={setSomeText}              
              placeholder="כתבו כאן משהו"
              error='שגיאה כלשהי'
            />

            {/* 


            <Input placeholder="test" />
            <InputWithLabel label="test" />
            <Button>test</Button>
            <IconButton icon="plus" />
            <Button onClick={handleBetaKeySubmit} isArrowButton={true}>
            להמשיך
          </Button> */}
          </div>
        </div>
        <div className="border border-gray-300 flex flex-col items-center justify-center h-[600px]">
          <div className="flex ">
            <button
              onClick={() => toggleDirection('ltr')}
              className={`px-4 py-2 ${
                direction === 'ltr' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              LTR
            </button>
            <button
              onClick={() => toggleDirection('rtl')}
              className={`px-4 py-2 ${
                direction === 'rtl' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              RTL
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="border bg-white border-gray-300  h-[600px]">test</div>
      </div>
    </div>
  );
};

export { UIKitTestPage };
