import React from 'react';

interface WizardProgressProps {
  totalSteps: number;
  currentStep: number;
}

const WizardProgress: React.FC<WizardProgressProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex justify-center space-x-3 rtl:space-x-reverse">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`w-2.5 h-2.5 rounded-full ${
            index === currentStep - 1 ? 'bg-slate-600' : 'bg-gray-300'
          }`}
        ></div>
      ))}
    </div>
  );
};

export default WizardProgress;
