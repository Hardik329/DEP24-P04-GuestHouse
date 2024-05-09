import React, { useState } from "react";
import { useSelector } from "react-redux";
import { privateRequest } from "../utils/useFetch";
import StepperComponent from "./Stepper";
import { toast } from "react-toastify";

const Workflow = ({ id, userRecord, reviewers, setReviewers }) => {
  const steps = ["Reservation Form", "Approval", "Room allocation", "Payment"];
  const [paymentId, setPaymentId] = useState({
    id: userRecord.payment.paymentId,
    confirmId: "",
  });
  console.log(userRecord);

  const { stepsCompleted } = userRecord;
  const user = useSelector((state) => state.user);
  const http = privateRequest(user.accessToken, user.refreshToken);
  const reviewer = reviewers.find((reviewer) => reviewer.role === user.role);
  const comments = reviewer?.comments;
  // const stepsCompleted = 2;
  return (
    <div className=" flex flex-col bg-[rgba(255,255,255,0.5)] rounded-lg items-center overflow-x-auto justify-center col-span-3 shadow-lg p-8 gap-10">
      <StepperComponent steps={steps} stepsCompleted={stepsCompleted || 0} />
      <div className="w-full mt-10 flex gap-3 lg:flex-col justify-around pr-3">
        {user.role === "CASHIER" && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-baseline justify-between w-full">
              <div> Payment ID:</div>
              <div>
                <input
                  onChange={(e) =>
                    setPaymentId((prev) => ({ ...prev, id: e.target.value }))
                  }
                  value={paymentId.id}
                  className="p-2 rounded-lg"
                ></input>
              </div>
            </div>
            <div className="flex items-baseline justify-between w-full">
              <div>Confirm Payment ID:</div>
              <div>
                <input
                  onChange={(e) =>
                    setPaymentId((prev) => ({
                      ...prev,
                      confirmId: e.target.value,
                    }))
                  }
                  value={paymentId.confirmId}
                  className="p-2 rounded-lg"
                ></input>
              </div>
            </div>
            <div className="justify-center flex w-full">
              <button
                className="p-3 px-4  mt-8 bg-[rgb(54,88,153)] rounded-lg text-white"
                onClick={() => {
                  if (paymentId.id !== paymentId.confirmId) {
                    toast.error("Payment ID does not match Confirm Payment ID");
                    return;
                  }
                  userRecord.payment.paymentId = paymentId.id;
                  userRecord.payment.status = "PAID";
                  console.log(userRecord);
                  try {
                    http.put("/reservation/" + id, userRecord);
                    toast.success("Payment Confirmed");
                    window.location.reload();
                  } catch (error) {
                    if (error.response?.data?.message)
                      toast.error(error.response.data.message);
                    else toast.error("Something went wrong");
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
        {user.role !== "USER" &&
          // user.role !== "ADMIN" &&
          user.role !== "CASHIER" && (
            <>
              <button
                onClick={async () => {
                  try {
                    await http.put("/reservation/approve/" + id, {
                      comments,
                    });
                    toast.success("Reservation Approved");
                    window.location.reload();
                  } catch (error) {
                    if (error.response?.data?.message) {
                      toast.error(error.response.data);
                    } else {
                      toast.error("An error occurred");
                    }
                  }
                }}
                className="border rounded-lg p-3 px-4 bg-green-400 hover:bg-green-500"
              >
                Approve
              </button>
              <button
                onClick={async () => {
                  try {
                    await http.put("/reservation/reject/" + id, {
                      comments,
                    });
                    toast.success("Reservation Rejected");
                    window.location.reload();
                  } catch (error) {
                    if (error.response?.data?.message) {
                      toast.error(error.response.data);
                    } else {
                      toast.error("An error occurred");
                    }
                  }
                }}
                className="border rounded-lg p-3 px-4 bg-red-400 hover:bg-red-500"
              >
                Reject
              </button>
              <button
                onClick={async () => {
                  try {
                    await http.put("/reservation/hold/" + id, {
                      comments,
                    });
                    toast.success("Reservation put on hold");
                    window.location.reload();
                  } catch (error) {
                    if (error.response?.data?.message) {
                      toast.error(error.response.data);
                    } else {
                      toast.error("An error occurred");
                    }
                  }
                }}
                className="border rounded-lg p-3 px-4 bg-yellow-400 hover:bg-yellow-500"
              >
                Review
              </button>
            </>
          )}
      </div>
      <div className="w-full">
        {user.role !== "USER" &&
          // user.role !== "ADMIN" &&
          user.role !== "CASHIER" && (
            <textarea
              // disabled={user.role !== "ADMIN"}
              className="w-full p-2 bg-white border-gray-500 rounded-lg"
              rows={5}
              value={comments || ""}
              onChange={(e) =>
                setReviewers((prev) =>
                  prev.map((r) =>
                    r.role === user.role
                      ? { ...r, comments: e.target.value }
                      : r
                  )
                )
              }
              placeholder={"Write any review or comments"}
            ></textarea>
          )}
      </div>
    </div>
  );
};

export default Workflow;
