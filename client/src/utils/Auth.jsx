import { Navigate, Outlet, useLocation } from "react-router-dom";

import React from "react";
import { useSelector } from "react-redux";

const Auth = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  let role = location.pathname.split("/");
  let redirect;
  if(role.length>3) role = role.slice(0,3)
  // console.log(role)
  if (role[1]) {
    role[1] = user.role.toLowerCase();
    redirect = role.join("/");
  }

  return allowedRoles.find((role) => user.role.includes(role)) ? (
    <Outlet />
  ) : user?.email ? (
    redirect ? (
      <Navigate to={redirect} />
    ) : (
      <Navigate to="/unauthorized" />
    )
  ) : (
    <Navigate to="/login" />
  );
};

export default Auth;
