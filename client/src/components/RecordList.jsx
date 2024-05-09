import React, { useEffect, useState } from "react";

import Checkbox from "@mui/material/Checkbox";
import { useSelector, useDispatch } from "react-redux";
import { privateRequest } from "../utils/useFetch";
import { useLocation, useNavigate } from "react-router-dom";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import TextField from "@mui/material/TextField";
import { getDate } from "../utils/handleDate";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function RecordList({ status = "pending", desc }) {
  const [checked, setChecked] = useState([]);
  const [values, setValues] = useState([]);
  const user = useSelector((state) => state.user);
  const [records, setRecords] = useState([]);
  const [newRecords, setNewRecords] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState("Loading");
  const [sortType, setSortType] = useState("");
  const [sortToggle, setSortToggle] = useState(false);
  const location = useLocation();

  const filterMap = {
    "Guest Name": "guestName",
    "Number of Rooms": "numberOfRooms",
    "Number of Guests": "numberOfGuests",
    Category: "category",
    "Arrival Date": "arrivalDate",
    "Departure Date": "departureDate",
    "Room Type": "roomType",
  };

  const navigate = useNavigate();

  const http = privateRequest(user.accessToken, user.refreshToken);

  const fetchRecords = async () => {
    try {
      let res;
      switch (desc) {
        case "current-requests":
          res = await http.get("/reservation/current");
          break;

        case "payment-pending":
          res = await http.get("/reservation/payment/pending");
          break;

        case "late-checkout":
          res = await http.get("/reservation/late");
          break;

        case "checked-out":
          res = await http.get("/reservation/checkedout");
          break;

        case "checkout-today":
          res = await http.get("/reservation/checkout/today");
          break;

        default:
          res = await http.get("/reservation/" + status);
          break;
      }
      const reservations = res.data;
      console.log(reservations);
      setValues(reservations.map((res) => res._id));
      setRecords(reservations);
      setNewRecords(reservations);
      setLoadingStatus("Success");
    } catch (err) {
      if (err.response?.data?.message) toast.error(err.response.data.message);
      else toast.error("Error fetching records");
      setLoadingStatus("Error");
    }
  };
  useEffect(() => {
    setLoadingStatus("Loading");
    fetchRecords();
  }, [status, desc]);

  const dispatch = useDispatch();
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);

    if (value === "#") {
      if (currentIndex === -1) {
        setChecked([...values, "#"]);
      } else {
        setChecked([]);
      }

      return;
    }

    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [searchChoice, setSearchChoice] = useState("Filter");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterRecords = () => {
    const tempRecords = records.filter((record) => {
      if (typeof record[filterMap[searchChoice]] === "string") {
        if (
          searchChoice === "Arrival Date" ||
          searchChoice === "Departure Date"
        ) {
          const date = new Date(record[filterMap[searchChoice]]);
          const formattedDate = getDate(date);

          return formattedDate.includes(searchTerm);
        } else {
          return record[filterMap[searchChoice]]
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }
      } else {
        const inputNum = parseInt(searchTerm);
        const num = record[filterMap[searchChoice]];
        return num === inputNum;
      }
    });

    setNewRecords(tempRecords);
  };

  useEffect(() => {
    if (searchTerm) filterRecords();
    else setNewRecords(records);
  }, [searchTerm, searchChoice]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const options = [
    "Guest Name",
    "Number of Rooms",
    "Number of Guests",
    "Category",
    "Arrival Date",
    "Departure Date",
    "Room Type",
  ];

  const handleSortToggle = (event) => {
    const type = event.target.outerText;
    setSortType(type);
    setSortToggle(!sortToggle);
  };

  useEffect(() => {
    const handleSort = () => {
      const tempRecords = [...newRecords];
      if (sortToggle) {
        if (sortType === "Number of Guests") {
          tempRecords.sort((a, b) => {
            return a.numberOfGuests - b.numberOfGuests;
          });
        } else if (sortType === "Number of Rooms") {
          tempRecords.sort((a, b) => {
            return a.numberOfRooms - b.numberOfRooms;
          });
        } else if (sortType === "Category") {
          tempRecords.sort((a, b) => {
            if (a.category > b.category) return 1;
            else return -1;
          });
        } else if (sortType === "Arrival Date") {
          tempRecords.sort((a, b) => {
            return new Date(a.arrivalDate) - new Date(b.arrivalDate);
          });
        } else if (sortType === "Departure Date") {
          tempRecords.sort((a, b) => {
            return new Date(a.arrivalDate) - new Date(b.arrivalDate);
          });
        }
      } else {
        if (sortType === "Number of Guests") {
          tempRecords.sort((a, b) => {
            return b.numberOfGuests - a.numberOfGuests;
          });
        } else if (sortType === "Number of Rooms") {
          tempRecords.sort((a, b) => {
            return b.numberOfRooms - a.numberOfRooms;
          });
        } else if (sortType === "Category") {
          tempRecords.sort((a, b) => {
            if (b.category > a.category) return 1;
            else return -1;
          });
        } else if (sortType === "Arrival Date") {
          tempRecords.sort((a, b) => {
            return new Date(b.arrivalDate) - new Date(a.arrivalDate);
          });
        } else if (sortType === "Departure Date") {
          tempRecords.sort((a, b) => {
            return new Date(b.arrivalDate) - new Date(a.arrivalDate);
          });
        }
      }
      setNewRecords(tempRecords);
    };
    handleSort();
  }, [sortToggle, sortType]);

  return (
    <div className=" flex p-2 px-0 w-full flex-col">
      <div className='text-center text-2xl font-["Dosis"] font-semibold py-2 uppercase'>
        {desc ? desc.toUpperCase().split("-").join(" ") : status + " requests"}
      </div>
      <div className="grid grid-cols-12 gap-8 mb-4">
        <div className="h-10 col-span-2 flex flex-col justify-center relative">
          <Button
            variant="contained"
            size="small"
            onClick={toggleDropdown}
            endIcon={isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            style={{ backgroundColor: "#365899", color: "#FFF" }}
            className="h-full"
          >
            {searchChoice}
          </Button>
          {isOpen && (
            <div className="absolute top-12 z-10 mt-2 py-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {options.map((option) => (
                <button
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                  onClick={() => {
                    setSearchChoice(option);
                    setIsOpen(!isOpen);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        <TextField
          label="Search items"
          variant="outlined"
          // sx={{ height: "2.5rem", paddingy:"15p", border:"1px solid black"}}
          className="col-span-10 w-full"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div
        sx={{ width: "100%", padding: "0px" }}
        className="bg-gray-50 rounded-md overflow-hidden"
      >
        <div className=" font-semibold border-b-2 text-[1.13vw]  w-full h-15" key="#">
          <div className="p-1 px-4 flex gap-4 w-full items-center justify-around text-center">
            <div className="flex items-center gap-2 w-[15%] overflow-hidden">
              <Checkbox
                edge="start"
                color="secondary"
                checked={checked.indexOf("#") !== -1}
                tabIndex={-1}
                className=" "
                onClick={handleToggle("#")}
                disableRipple
              />
              <div onClick={handleSortToggle} className="w-full">
                Name
              </div>
            </div>
            <div onClick={handleSortToggle} className="w-[10%] ">
              No. of Guests
            </div>
            <div onClick={handleSortToggle} className="w-[10%] ">
              No. of Rooms
            </div>
            <div onClick={handleSortToggle} className="w-[10%] ">
              Category
            </div>
            <div onClick={handleSortToggle} className="w-[10%] ">
              Arrival Date
            </div>
            <div onClick={handleSortToggle} className="w-[10%] ">
              Departure Date
            </div>
            <div onClick={handleSortToggle} className="w-[10%] ">
              Room Type
            </div>
            <div className="flex justify-evenly gap-2 w-[10%]">
              {checked.length > 0 && (
                <IconButton>
                  <DeleteIcon className="text-gray-300" />{" "}
                </IconButton>
              )}
            </div>

            <div />
          </div>
        </div>
        {loadingStatus === "Success" && newRecords.length > 0 && (
          <div className="h-96 overflow-y-auto">
            {newRecords.map((record) => {
              const labelId = `checkbox-list-label-${record._id}`;
              return (
                <div
                  key={record._id}
                  className="border-b-[1px] border-gray-100 items-center flex gap-4 text-center justify-around px-4 p-1 text-[1vw]"
                >
                  <div className="flex items-center gap-2 w-[15%] overflow-hidden">
                    <Checkbox
                      edge="start"
                      checked={checked.indexOf(record._id) !== -1}
                      onClick={handleToggle(record._id)}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                    <div className="w-full">{record.guestName}</div>
                  </div>
                  <div className="w-[10%]">{record.numberOfGuests}</div>
                  <div className="w-[10%]">{record.numberOfRooms}</div>
                  <div className="w-[10%]">{record.category}</div>
                  <div className="w-[10%]">{getDate(record.arrivalDate)}</div>
                  <div className="w-[10%]">{getDate(record.departureDate)}</div>
                  <div className="w-[10%]">{record.roomType}</div>
                  <div className="flex justify-evenly gap-4 w-[10%]">
                    <IconButton>
                      <InsertDriveFileIcon
                        onClick={() => {
                          location.pathname.split("/").length === 3
                            ? navigate(`${record._id}`)
                            : navigate(`../${record._id}`);
                        }}
                        color="black"
                      />
                    </IconButton>
                    <IconButton>
                      <DownloadIcon
                        onClick={async () => {
                          try {
                            const res = await http.get(
                              "/reservation/documents/" + record._id,
                              { responseType: "blob" }
                            );
                            var file = window.URL.createObjectURL(res.data);
                            window.location.assign(file);
                          } catch (error) {
                            toast.error("Something went wrong");
                          }
                        }}
                        color="black"
                      />
                    </IconButton>
                    {record.payment.status === "PAID" && !record.checkOut && (
                      <IconButton>
                        <LogoutIcon
                          onClick={async () => {
                            try {
                              const res = await http.put(
                                "/reservation/checkout/" + record._id
                              );
                              toast.success("Checked out successfully");
                              window.location.reload();
                            } catch (error) {
                              console.log(error);
                              toast.error(error.response?.data?.message);
                            }
                          }}
                          color="black"
                        />
                      </IconButton>
                    )}
                  </div>

                  <div />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {loadingStatus === "Loading" && (
        <div className="p-2 text-center pt-5 font-semibold">Loading...</div>
      )}
      {loadingStatus === "Success" && records.length === 0 && (
        <div className="p-2 text-center pt-5 font-semibold">
          No records found
        </div>
      )}
      {loadingStatus === "Error" && (
        <div className="p-2 text-center pt-5 font-semibold">
          Error fetching records!
        </div>
      )}
    </div>
  );
}
