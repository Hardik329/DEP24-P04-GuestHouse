import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import TextField from "@mui/material/TextField";
import {useSelector, useDispatch} from "react-redux";

import DeleteIcon from "@mui/icons-material/Delete";
import Slider from "@mui/material/Slider";

import http from "../utils/httpService";

function valuetext(value) {
  return `${value}`;
}

export default function DiningList({ 
  status = "pending",
  source,
  paymentstatus,
}) {
  const low = 0;
  const high = 500;
  const [checked, setChecked] = useState([]);
  const [values, setValues] = useState([]);
  const user = useSelector((state) => state.user);
  const [records, setRecords] = useState([]);
  const [newRecords, setNewRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchChoice, setSearchChoice] = useState("Filter");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Loading");
  const [sortToggle, setSortToggle] = useState(false);
  const [amount, setAmount] = useState([low, high]);

  const handleChange = (event, newAmount) => {
    setAmount(newAmount);
  };
  const options = ["Email", "Total Amount"];
  const filterMap = {
    Email: "email",
    "Total Amount": "amount",
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const filterRecords = () => {
    const tempRecords = records.filter((record) => {
      if (searchChoice === "Total Amount") {
        const num = record[filterMap[searchChoice]];
        if (amount[1] < 500) {
          return amount[0] <= num && num <= amount[1];
        } else {
          return num >= amount[0];
        }
      } else {
        const valueToSearch = record[filterMap[searchChoice]];
        return typeof valueToSearch === 'string' && valueToSearch.toLowerCase().includes(searchTerm?.toLowerCase());
      }
    });
    setNewRecords(tempRecords);
  };

  const handleSortToggle = () => {
    setSortToggle(!sortToggle);
  };
  useEffect(() => {
    const handleSort = () => {
      if (sortToggle) {
        const tempRecords = [...newRecords];
        tempRecords.sort((a, b) => {
          return a.amount - b.amount;
        });
        setNewRecords(tempRecords);
      } else {
        const tempRecords = [...newRecords];
        tempRecords.sort((a, b) => {
          return b.amount - a.amount;
        });
        setNewRecords(tempRecords);
      }
    };

    handleSort();
  }, [sortToggle]);

  useEffect(() => {
    if (searchTerm || amount) filterRecords();
    else setNewRecords(records);
  }, [searchTerm, searchChoice, amount]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (searchTerm) {
      filterRecords();
    } else {
      setNewRecords(records);
    }
  }, [searchTerm, searchChoice]);

  const navigate = useNavigate();

  const fetchRecords = async () => {
    console.log(status)

    try {
      let res;
      if (source === "Department" && paymentstatus === false) {
        res = await http.get("/dining/payment-pending-department");
      } else if (source === "Guest" && paymentstatus === false) {
        res = await http.get("/dining/payment-pending-guest");
      } else if (source === "Department" && paymentstatus === true) {
        res = await http.get("/dining/payment-done-department");
      } else if (source === "Guest" && paymentstatus === true) {
        res = await http.get("/dining/payment-done-guest"); 
      } else {
        res = await http.get("/dining/" + status);
      }

      let orders = res?.data || [];
      console.log(orders);
      orders = orders.filter((order) => order.status?.toLowerCase() == status);
      setValues(orders.map((res) => res._id));
      setRecords(orders);
      setNewRecords(orders);
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
  }, [status,source,paymentstatus]);

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

  return (
    <div className=" flex p-2 px-0 w-full flex-col">
      <div className='text-center text-2xl font-["Dosis"] font-semibold py-2 uppercase'>
        Dining Records
      </div>
      <div className="grid grid-cols-12 gap-8 mb-4">
        <div className="col-span-2 flex flex-col justify-center relative h-10">
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
        {searchChoice == "Email" && (
          <TextField
            label="Search items"
            variant="outlined"
            size="small"
            className="col-span-10 w-full p-2.5 h-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        )}
        {searchChoice == "Total Amount" && (
          <div className="flex gap-5 items-center w-[600px]">
            {low}
            <Slider
              getAriaLabel={() => "Temperature range"}
              sx={{ width: "300px" }}
              value={amount}
              onChange={handleChange}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              min={low}
              max={high}
            />
            {high}+
          </div>
        )}
      </div>
      <List
        sx={{ width: "100%", padding: "0px" }}
        className="bg-gray-50 rounded-md border overflow-hidden"
      >
        <div className="font-semibold border-b-2 text-[1.13vw] w-full" key="#">
          <div className="p-1 px-4 flex gap-4 w-full items-center text-center">
            <div className="flex items-center gap-2 w-[1%]">
              <Checkbox
                edge="start"
                color="secondary"
                checked={checked.indexOf("#") !== -1}
                tabIndex={-1}
                className=" "
                onClick={handleToggle("#")}
                disableRipple
              />
            </div>
            <div className="w-[30%]">Email</div>
            <div className="w-[30%]">Total Amount</div>
            <div className="w-[35%]">Status</div>
            <div className="w-[35%]">Actions</div>
            <div className="flex justify-evenly gap-2 w-[5%]">
              {checked.length > 0 && (
                <div className="flex">
                  <IconButton edge="end" aria-label="comments">
                    <DeleteIcon className="text-gray-600" />
                  </IconButton>
                </div>
              )}
            </div>
          </div>
        </div>
        {loadingStatus === "Success" && newRecords.length > 0 && (
          <div className="h-96  overflow-y-auto">
            {newRecords.map((record) => {
              const labelId = `checkbox-list-label-${record._id}`;

              return (
                <div
                  key={record._id}
                  className="border-b-[1px] border-gray-100 items-center flex gap-4 text-center px-4 p-1 text-[1vw]"
                >
                  <div className="flex items-center gap-2 w-[1%]">
                    <Checkbox
                      edge="start"
                      checked={checked.indexOf(record._id) !== -1}
                      onClick={handleToggle(record._id)}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </div>
                  <div className="w-[30%] text-center">{record.email}</div>
                  <div className="w-[30%]">{record.amount}</div>
                  <div className="w-[30%]">{status.toUpperCase()}</div>
                  <div className="w-[34%]">
                    <IconButton edge="end" aria-label="insert">
                      <InsertDriveFileIcon
                        onClick={() => {
                          status === "pending"
                            ? navigate(`${record._id}`)
                            : navigate(`../${record._id}`);
                        }}
                        color="black"
                      />
                    </IconButton>
                  </div>
                  <div className="w-[5%]"></div>
                </div>
              );
            })}
          </div>
        )}
      </List>
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
