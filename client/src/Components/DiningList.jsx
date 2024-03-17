import React, { useEffect, useState } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";
import { useSelector, useDispatch } from "react-redux";
import { privateRequest } from "../utils/useFetch";
import { useNavigate } from "react-router-dom";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import tick from "../images/tick.png";
import cross from "../images/cross.png";

export default function DiningList({ status = "pending" }) {
  const [checked, setChecked] = useState([]);
  const [values, setValues] = useState([]);
  const user = useSelector((state) => state.user);
  const [records, setRecords] = useState([]);

  const navigate = useNavigate();

  const makeRequest = privateRequest(user.accessToken, user.refreshToken);
  console.log(makeRequest);

  const fetchRecords = async () => {
    try {
      const res = await makeRequest.get("/dining/all");
      console.log(res.data);
      const orders = res.data;
      setValues(orders.map((res) => res._id));
      setRecords(orders);
    } catch (err) {
      console.log(err.response.data);
    }
  };
  //console.log(records);
  useEffect(() => {
    fetchRecords();
  }, [status]);
  console.log(records);
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className=" flex p-5 px-0 w-full flex-col">
      <div className='text-center text-3xl font-["Dosis"] font-semibold py-4 uppercase'>
        Dining Records
      </div>
      <div>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2.5 border-2 border-slate-200 my-4 rounded-lg box-border focus:border-slate-400 focus:outline-none"
        />
      </div>
      <List
        sx={{ width: "100%", padding: "0px" }}
        className="bg-gray-50 rounded-md overflow-hidden"
      >
        <ListItem
          className=" bg-[#365899] text-white"
          key="#"
          secondaryAction={
            <IconButton edge="end" aria-label="comments">
              {/* <CommentIcon /> */}
            </IconButton>
          }
          disablePadding
        >
          <ListItemButton
            role={undefined}
            dense
            onClick={handleToggle("#")}
            sx={{ paddingY: "10px" }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                color="secondary"
                checked={checked.indexOf("#") !== -1}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": "checkbox-list-label-header" }}
              />
            </ListItemIcon>
            <ListItemText
              id="checkbox-list-label-header"
              className=" text-wrap w-12"
              sx={{ overflow: "hidden" }}
              primary="Email"
            />
            <ListItemText
              id="checkbox-list-label-header"
              className=" text-wrap w-8 text-center"
              primary="Total Amount"
            />
            <ListItemText
              id="checkbox-list-label-header"
              className=" text-wrap w-8 text-center"
              primary="Status"
            />
          </ListItemButton>
        </ListItem>
        {console.log(records)}
        {records.map((record) => {
          const labelId = `checkbox-list-label-${record._id}`;

          return (
            <ListItem
              key={record._id}
              className="border-b"
              secondaryAction={
                <div>
                  <IconButton
                    edge="end"
                    aria-label="comments"
                    onClick={() => navigate(`${record._id}`)}
                  >
                    <InsertDriveFileIcon color="black" />
                  </IconButton>
                </div>
              }
              disablePadding
            >
              <ListItemButton
                className=""
                sx={{ paddingY: "10px" }}
                onClick={handleToggle(record._id)}
                role={undefined}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.indexOf(record._id) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": labelId }}
                  />
                </ListItemIcon>

                <ListItemText
                  id="checkbox-list-label-header"
                  className=" text-wrap w-12"
                  sx={{ overflow: "hidden" }}
                  primary={record.email}
                />
                <ListItemText
                  id="checkbox-list-label-header"
                  className=" text-wrap w-10 text-center"
                  primary={record.amount}
                />
                <ListItemText
                  id="checkbox-list-label-header"
                  className=" text-wrap w-10 text-center"
                  primary={"PENDING"}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}