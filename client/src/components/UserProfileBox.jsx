import React from 'react';
import profile from "../images/profile-photo.png";
import DrRaviKumar from "../images/Professors/DrRaviKumar.jpeg"
import DrPushpendraPal from "../images/Professors/DrPushpendraPal.png"
import DrSukritGupta from "../images/Professors/DrSukritGupta.png"
import MsKarishmaChaudhary from "../images/Professors/MsKarishmaChaudhary.png"

const UserProfileBox = ({user}) => {
  const profilePhoto = {
    1 : DrRaviKumar,
    2 : DrPushpendraPal,
    3 : DrSukritGupta,
    4 : profile,
    5 : MsKarishmaChaudhary,
    6 : profile
  }
  return (
    <div className="bg-white border rounded-md p-4 shadow-md flex flex-col h-80 w-80 justify-center">
      <div className="mb-4">
        <img src={profilePhoto[user.key]} alt="User Profile" className="rounded-full w-16 h-16 mx-auto" />
      </div>

      <div className="mb-2 text-center">
        <h2 className="text-xl font-bold">{user.name}</h2>
      </div>

      <div className="mb-2 text-center">
        <h3 className="text-lg font-medium">{user.post}</h3>
      </div>

      <div className="mb-2 text-center">
        <p className="text-sm">{user.email}</p>
      </div>

      <div className="text-center">
        <p className="text-sm">{user.contact}</p>
      </div>
    </div>
  );
};

export default UserProfileBox;