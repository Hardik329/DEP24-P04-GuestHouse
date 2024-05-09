import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios"; // Assuming you use axios for API requests
import Workflow from "../components/Workflow";
import { privateRequest } from "../utils/useFetch";
import { Checkbox } from "@mui/material";
import { getDate, getTime } from "../utils/handleDate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function AdminRecordPage() {
  const { id } = useParams();

  const user = useSelector((state) => state.user);

  const http = privateRequest(user.accessToken, user.refreshToken);

  const [status, setStatus] = useState("Loading");

  const [totalDiningFare, setTotalDiningFare] = useState(0);
  const [totalRoomFare, setTotalRoomFare] = useState(0);
  const [totalFare, setTotalFare] = useState(0);

  const color = {
    PENDING: "bg-gray-400",
    APPROVED: "bg-green-400",
    REJECTED: "bg-red-400",
    HOLD: "bg-yellow-400",
  };

  const [reviewers, setReviewers] = useState([]);

  const [userRecord, setUserRecord] = useState({
    guestName: "",
    address: "",
    numberOfGuests: "",
    numberOfRooms: "",
    roomType: "",
    arrivalDate: "",
    departureDate: "",
    purpose: "",
    category: "",
  });
  const [checkedValues, setCheckedValues] = useState([]);

  const roles = [
    "DIRECTOR",
    "HOD",
    "DEAN",
    "REGISTRAR",
    "CHAIRMAN",
    "ASSOCIATE DEAN",
  ];

  const roomPricesB = {'Single Occupancy': 600, 'Double Occupancy': 850}
  const roomPricesC = {'Single Occupancy': 900, 'Double Occupancy': 1250}
  const roomPricesD = {'Single Occupancy': 1300, 'Double Occupancy': 1800}

  useEffect(() => {
    const fetchRecord = async () => {
      console.log("fetching record...");
      try {
        const response = await http.get(`/reservation/${id}`);
        setStatus("Success");
        setUserRecord(response.data.reservation);
        setReviewers(response.data.reservation.reviewers);
        console.log(response.data);
        setCheckedValues(
          response.data.reservation.reviewers.map(
            (reviewer) => reviewer.role
          ) || []
        );
        if(response.data.reservation.category === 'B') {
          setTotalRoomFare(roomPricesB[response.data.reservation.roomType])
        } 
        if(response.data.reservation.category === 'C') {
          setTotalRoomFare(roomPricesC[response.data.reservation.roomType])
        } 
        if(response.data.reservation.category === 'D') {
          setTotalRoomFare(roomPricesD[response.data.reservation.roomType])
        } 
      } catch (error) {
        setStatus("Error");
        console.error("Error fetching user data:", error);
      }
    };

    const getDiningAmount = async () => {
      try {
        const response = await http.post(`/reservation/${id}`, {
          id: id
        });
        setTotalDiningFare(response.data.totalAmount)
      }
      catch (error) {
        setStatus("Error");
        console.error("Error total Dining Amount:", error);
      }
    }

    getDiningAmount()

    fetchRecord();
  }, [id]);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setCheckedValues((prevCheckedValues) => [...prevCheckedValues, value]);
    } else {
      setCheckedValues((prevCheckedValues) =>
        prevCheckedValues.filter((item) => item !== value)  
      );
    }
  };

  useEffect(() => {
    setTotalFare(totalDiningFare + totalRoomFare)
  }, [totalDiningFare, totalRoomFare])

  if (status === "Error") return <Navigate to="/404" />;
  else if (status === "Loading") return <div className="flex h-full w-full text-xl font-semibold items-center justify-center">Loading...</div>;


  return (
    <>
      <div className="grid grid-cols-8 m-9 gap-4">
        <Workflow
          id={id}
          userRecord={userRecord}
          setUserRecord={setUserRecord}
          reviewers={reviewers}
          setReviewers={setReviewers}
        />

        <div className='col-span-5 shadow-lg flex flex-col overflow-auto justify-center gap-4 font-["Dosis"] bg-[rgba(255,255,255,0.5)] rounded-lg pt-4'>
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Guest Name:</p>
            <p className="p-2 text-lg">{userRecord.guestName}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Address:</p>
            <p className="p-2 text-lg">{userRecord.address}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Number Of Guests:</p>
            <p className="p-2 text-lg">{userRecord.numberOfGuests}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Number Of Rooms:</p>
            <p className="p-2 text-lg">{userRecord.numberOfRooms}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Room Type</p>
            <p className="p-2 text-lg">{userRecord.roomType}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Arrival Date</p>
            <p className="p-2 text-lg">{getDate(userRecord.arrivalDate)}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Arrival Time:</p>
            <p className="p-2 text-lg">{getTime(userRecord.arrivalDate)}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Departure Date:</p>
            <p className="p-2 text-lg">{getDate(userRecord.departureDate)}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Departure Time:</p>
            <p className="p-2 text-lg">{getTime(userRecord.departureDate)}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32">
            <p className="p-2 text-xl font-semibold">Purpose:</p>
            <p className="p-2 text-lg">{userRecord.purpose}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32 pb-5">
            <p className="p-2 text-xl font-semibold">Category:</p>
            <p className="p-2 text-lg">{userRecord.category}</p>
          </div>
          <hr />
          <div className="flex justify-between px-32 pb-5">
            <p className="p-2 text-xl font-semibold">Room Fare:</p>
            <p className="p-2 text-lg">Rs. {totalRoomFare}/- only</p>
          </div>
          <div className="flex justify-between px-32 pb-5">
            <p className="p-2 text-xl font-semibold">Dining Fare:</p>
            <p className="p-2 text-lg">Rs. {totalDiningFare}/- only</p>
          </div>
          <div className="flex justify-between px-32 pb-5">
            <p className="p-2 text-xl font-semibold">Total Amount:</p>
            <p className="p-2 text-lg">Rs. {totalFare}/- only</p>
          </div>
        </div>
      </div>
      <div className='col-span-5 md:flex-col overflow-auto shadow-lg flex justify-between p-5  gap-4 m-9 font-["Dosis"] bg-[rgba(255,255,255,0.5)] rounded-lg'>
        
          <div>
            <div className="text-2xl font-semibold font-['Dosis'] px-5">
              Status
            </div>
            <div className="p-5 flex flex-col gap-4 ">
              {reviewers.map((reviewer) => (
                <div className="flex gap-4 w-max">
                  <div className="w-20">{reviewer.role}</div>
                  <div
                    className={
                      "border rounded-full relative top-1 w-5 h-5 " + color[reviewer.status]
                    }
                  ></div>
                  <div className="w-72">{reviewer.comments}</div>
                </div>
              ))}
            </div>
            <div>
              {user.role === "ADMIN" && (
                <div className="ml-5 m-2 w-fit">
                  <Link
                    state={{ userRecord: userRecord }}
                    className="p-2 bg-[rgb(54,88,153)] rounded-lg text-white"
                    to={"rooms"}
                  >
                    Room Booking
                  </Link>
                </div>
              )}
            </div>
          </div>
          {userRecord.bookings?.length > 0 && (
          <div>
            <div className="text-2xl text-center font-semibold font-['Dosis'] px-5">
              Rooms Assigned
            </div>
            <div className="p-5 flex flex-col gap-4 ">
              <div className="flex gap-4 font-semibold text-center">
                <div className="w-24">Start Date</div>
                <div className="w-24">End Date</div>
                <div className="w-24">Room Number</div>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-28">
                {userRecord.bookings.map((booking) => (
                  <div className="flex gap-4 text-center">
                    <div className="w-24">{getDate(booking.startDate)}</div>
                    <div className="w-24">{getDate(booking.endDate)}</div>
                    <div className="w-20">{booking.roomNumber}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      {/* <div className='col-span-5 md:flex-col overflow-auto shadow-lg flex justify-between  p-5  gap-4 m-9 font-["Dosis"] bg-[rgba(255,255,255,0.5)] rounded-lg'>
        
      </div> */}
    </>
  );
}
