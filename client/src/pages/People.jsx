import React from "react";
import UserProfileBox from "../components/UserProfileBox";

const People = () => {
  const users = [
    {
      key: 1,
      name: "Dr. Ravi Kumar",
      post: "Chairman",
      email: "ravi.kumar@iitrpr.ac.in",
    },
    {
      key: 2,
      name: "Dr. Pushpendra Pal Singh",
      post: "Member",
      email: "pps@iitrpr.ac.in",
    },
    {
      key: 3,
      name: "Dr. Sukrit Gupta",
      post: "Member",
      email: "sukrit.gupta@iitrpr.ac.in",
    },
    {
      key: 4,
      name: "Sh. Aman Sethi",
      post: "Member",
      email: "aman.sethi@iitrpr.ac.in",
    },
    {
      key: 5,
      name: "Ms. Karishma Chaudhary",
      post: "Member",
      email: "karishma.chaudhary@iitrpr.ac.in",
    },
    {
      key: 6,
      name: "Sh. Vijay Singh",
      post: "Member",
      email: "vijaysingh@iitrpr.ac.in",
    }
  ];

  return (
    <div className='people w-5/6 flex flex-wrap justify-around gap-18 gap-y-12 my-10'>
      {users.map((item, index) => {
        return <UserProfileBox key={"user-" + index} user={item} />;
      })}
    </div>
  );
};

export default People;
