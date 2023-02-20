import { Bars2Icon } from "@heroicons/react/24/solid";
import {
  defaultTherapist,
  getTherapist,
  Therapist,
  therapistsState,
  userProfileState,
} from "../atoms/dataStore";
import { Avatar, AvatarStyles } from "./Avatar";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const userProfile = useRecoilValue(userProfileState);
  const therapists = useRecoilValue(therapistsState);
  const [therapist, setTherapist] = useState<Therapist>();

  useEffect(() => {
    console.log("header, set therapist", therapists, userProfile.activeChat);
    setTherapist(
      getTherapist(therapists, userProfile.activeChat || "") || defaultTherapist
    );
  }, [therapists]);

  return (
    <header className="p-4 flex justify-between items-center">
      <div
        className="p-1 rounded-2xl bg-gray-200 hover:bg-gray-200 w-9 h-9 cursor-pointer flex items-center justify-center"
        onClick={onMenuClick}
      >
        <Bars2Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div className="headerImageAndText flex flex-row items-center w-full text-left pl-5">
        <Avatar
          imageUrl={therapist?.avatar || ""}
          avatarStyle={AvatarStyles.logo}
        />
        <div className="ml-3">
          <div className="text-2xl font-normal">{therapist?.name}</div>
          <div className="text-xs font-light">{therapist?.description}</div>
        </div>
      </div>

      <div></div>
    </header>
  );
};

export { Header };
