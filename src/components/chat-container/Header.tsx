import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';
import logo from '../../assets/l3.png';

interface HeaderProps {
  title: string;
  description: string;
  onMinimize: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, description, onMinimize }) => {
  return (
    <div className="flex justify-between items-center space-y-2 space-x-3 pb-5 ">
      <img className="h-12 bg-lime-200 rounded-full mt-2 p-2" src={logo} loading="lazy" />      
      <div className=' flex-1'>
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        <p className="text-sm text-[#6b7280] leading-4 max-w-52">
          {description}
        </p>
      </div>
      <div className="flex space-x-2">
        <button className="bg-gray-200 rounded-full p-1 hover:bg-gray-300  " onClick={onMinimize}>
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export { Header };
