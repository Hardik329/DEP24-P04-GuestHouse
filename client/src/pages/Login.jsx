import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import { GoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "../constants";

import logo from "./../images/IIT_Ropar_logo.png";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "./Login.css"

const OTP_RESEND_TIME = 60;

const Login = () => {
  const navigate = useNavigate();

  const [showOtp, setShowOtp] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) setSeconds(seconds - 1);
      if (seconds === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const [credentials, setCredentials] = useState({
    email: "",
    otp: "",
    name: "",
    contact: "",
  });

  // const [showPassword, setShowPassword] = useState(false);

  const handleOtp = (e) => {
    console.log(e.target.value);
    let val = e.target.value;
    val = val.replace(/\D/g, "");
    if (val.length > 6) val = val.substring(0, 6);
    setCredentials((prev) => ({ ...prev, otp: val }));
  };

  const handleChange = (e) => {
    console.log(e.target.validity);
    setCredentials((user) => ({ ...user, [e.target.name]: e.target.value }));
  };

  const sendOtp = async () => {
    try {
      const res = await axios.post(BASE_URL + "/auth/otp", {
        email: credentials.email,
      });
      setSeconds(OTP_RESEND_TIME);
      toast.success("OTP sent successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // const verifyOTP = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.post(BASE_URL + "/auth/verifyOTP", {
  //       email: credentials.email,
  //       otp: credentials.otp,
  //     });
  //     console.log(res);
  //     if (res.data.success) {
  //       toast("OTP verified successfully");
  //       if (res.data.user) {
  //         navigate("/home");
  //       } else {
  //         setIsLogin(false);
  //       }
  //     } else {
  //       toast(res.data.message);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     toast(err.response.data?.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (
    //   credentials.email.match("[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$") === null
    // ) {
    //   toast("invalid email");
    //   return;
    // }

    if (!showOtp) {
      try {
        const res = await toast.promise(
          axios.post(BASE_URL + "/auth/otp", {
            email: credentials.email,
          }),
          {
            pending: "Sending OTP",
            success: "OTP sent successfully",
            error: {
              render({ data }) {
                return data.response.data.error;
              },
            },
          }
        );
        setShowOtp(true);
        setSeconds(OTP_RESEND_TIME);

        console.log(res);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log(credentials);
      try {
        const res = await axios.post(
          BASE_URL + `/auth/${isLogin ? "login" : "register"}`,
          {
            ...credentials,
          }
        );
        console.log(res);

        if (res.data.user) {
          navigate("/");
        } else {
          console.log("here");
          setIsLogin(false);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <ToastContainer />
      <div className="flex flex-col items-center justify-center bg-[#365899] text-white p-5">
        <img
          className="h-24 "
          src={logo}
        />
        <div className="text-3xl font-semibold p-2">
          Welcome to Guest House Portal
        </div>
        <div className="font-medium">
          Indian Institute of Technology, Ropar(Punjab)
        </div>
      </div>

      <div className="flex justify-center items-center h-full border bg-[#f4f4f4]">
        <div className="flex flex-col border justify-center items-center w-[29%] bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="p-2 text-3xl font-semibold bg-[#3498db] text-white w-full text-center">
            Welcome
          </div>

          <div className="m-5 flex flex-col items-center w-full ">
            {isLogin ? (
              <>
                <div className=" font-semibold text-2xl">LOG IN</div>

                <div className="w-full p-5 flex flex-col gap-5 items-center">
                  <input
                    placeholder="Email"
                    pattern="[0-9]+"
                    className="p-2 border rounded-md text-sm h-12 w-full "
                    onChange={handleChange}
                    name="email"
                    value={credentials.email}
                  />
                  {/* <TextField
                    id="outlined-basic"
                    label="Outlined"
                    variant="outlined"
                    fullWidth
                    size="small"
                    className="text-red-500"
                  /> */}
                  {showOtp && (
                    <div className="w-full flex flex-col">
                      <div className="flex w-full justify-between gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="otp"
                          value={credentials.otp}
                          onChange={handleOtp}
                          placeholder="OTP"
                          className="p-2 border rounded-md text-sm h-12 w-full "
                        />
                        <button
                          className="border bg-black bg-[rgba(0,0,0,0.9)] disabled:cursor-not-allowed disabled:opacity-70 text-white w-full p-2 lg"
                          onClick={() => sendOtp()}
                          disabled={seconds > 0}
                        >
                          Resend OTP
                        </button>
                      </div>
                      {seconds > 0 && (
                        <div className="text-sm mt-2">
                          Time Remaining: {Math.floor(seconds / 60) < 10 && "0"}
                          {Math.floor(seconds / 60)}:{seconds % 60 < 10 && "0"}
                          {seconds % 60}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    className="border bg-black bg-[rgba(0,0,0,0.9)] text-white w-full p-2 lg"
                    onClick={handleSubmit}
                  >
                    {showOtp ? "Log In" : "Send OTP"}
                  </button>

                  <div className="text-center">OR</div>

                  <GoogleLogin
                    className="w-full"
                    onSuccess={(res) => {
                      navigate("/", { replace: true });
                      if (res.credential != null) {
                        const cred = jwtDecode(res.credential);
                        console.log(cred);
                      }

                      console.log("Success");
                      console.log("Logged In");
                    }}
                    onError={() => {
                      console.log("Failed");
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className=" font-semibold text-2xl">REGISTER</div>

                <div className="w-full p-5 flex flex-col gap-5 items-center">
                  <form className="flex flex-col gap-5 items-center w-full">
                    <input
                      placeholder="Email"
                      disabled
                      className="p-2 border rounded-md text-sm h-12 w-full"
                      onChange={handleChange}
                      name="email"
                      value={credentials.email}
                    />
                    <input
                      placeholder="Name"
                      className="p-2 border rounded-md text-sm h-12 w-full"
                      onChange={handleChange}
                      name="name"
                      value={credentials.name}
                    />
                    <input
                      placeholder="Contact"
                      pattern="[0-9]+"
                      className="p-2 border rounded-md text-sm h-12 w-full"
                      onChange={handleChange}
                      name="contact"
                      value={credentials.contact}
                    />
                    <button
                      className="border bg-black text-white w-full p-2 lg"
                      onClick={handleSubmit}
                    >
                      Register
                    </button>
                  </form>
                  <div className="text-center">OR</div>

                  <GoogleLogin
                    className="w-full"
                    onSuccess={(res) => {
                      navigate("/", { replace: true });
                      if (res.credential != null) {
                        const cred = jwtDecode(res.credential);
                        console.log(cred);
                      }

                      console.log("Success");
                      console.log("Logged In");
                    }}
                    onError={() => {
                      console.log("Failed");
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
