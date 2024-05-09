import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Meal from "../models/Meal.js";
import { getDate, getTime, transporter } from "../utils.js";
import archiver from "archiver";
import { getFileById } from "../middlewares/fileStore.js";
import mongoose from "mongoose";
import { google } from "googleapis";
import { appendReservationToSheet } from "./google_sheet.js";

const googleSheets = google.sheets("v4");
const auth = new google.auth.JWT(
  process.env.client_email,
  null,
  process.env.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const spreadsheetId = `${process.env.GOOGLE_SHEET_ID}`; // Replace with your Google Sheet's ID

// async function appendReservationToSheet(reservation) {
//   await auth.authorize();
//   const response = await googleSheets.spreadsheets.values.append({
//     auth,
//     spreadsheetId,
//     range: "Sheet1", // Assuming you are using the first sheet; change if necessary
//     valueInputOption: "RAW",
//     resource: {
//       values: [
//         [
//           reservation.guestName,
//           reservation.guestEmail,
//           reservation.numberOfGuests,
//           reservation.numberOfRooms,
//           reservation.roomType,
//           reservation.arrivalDate,
//           reservation.departureDate,
//           reservation.purpose,
//           reservation.category,
//           // Add more fields as necessary
//         ],
//       ],
//     },
//   });
//   return response;
// }

async function sendVerificationEmail(to, subject, body) {
  try {
    const info = await transporter.sendMail({
      from: "dep.test.p04@gmail.com",
      to: to, // list of receivers
      subject: subject, // Subject line
      html: body, // plain text body
    });
    console.log("Message sent", info.messageId);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

export async function createReservation(req, res) {
  try {
    //user details are contained in req.user

    const {
      numberOfGuests,
      numberOfRooms,
      roomType,
      purpose,
      guestName,
      arrivalDate,
      arrivalTime,
      departureTime,
      address,
      category,
      departureDate,
      reviewers,
      applicant,
      source,
    } = req.body;
    console.log(source);
    console.log(applicant[0]);
    const applicantData = JSON.parse(applicant[0]);
    console.log(applicantData);

    const email = req.user.email;
    const receiptid = req.files["receipt"][0].id;
    const fileids = req.files["files"]?.map((f) => ({
      refid: f.id,
      extension: f.originalname.split(".")[1],
    }));
    console.log(reviewers);
    const reviewersArray = reviewers.split(",").map((role) => ({
      role,
      comments: "",
      status: "PENDING",
    }));
    const reservation = await Reservation.create({
      srno: 1,
      guestEmail: email,
      guestName,
      address,
      purpose,
      numberOfGuests,
      numberOfRooms,
      roomType,
      arrivalDate: new Date(`${arrivalDate}T${arrivalTime}`),
      departureDate: new Date(`${departureDate}T${departureTime}`),
      category,
      stepsCompleted: 1,
      files: fileids,
      payment: { source: source },
      applicant: applicantData,
      reviewers: reviewersArray,
      receipt: receiptid,
    });

    const revArray = reviewersArray.map((reviewer) => reviewer.role);

    await appendReservationToSheet(reservation, category);

    console.log("sending mail");
    console.log("\n\n\n\n", reviewersArray, "\n\n\n\n");
    const users = await User.find({
      role: { $in: revArray },
    });
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        user.pendingRequest += 1;

        // Save the updated user document
        await user.save();
      } else {
        console.log("User not found");
      }
    } catch (err) {
      console.log("Error updating user:", err);
    }

    const emails = users.map((user) => user.email);
    sendVerificationEmail(
      emails,
      "New Reservation Request",
      "<div>A new reservation request has been made.</div><br><br><div>Guest Name: " +
        guestName +
        "</div><br><div>Guest Email: " +
        email +
        "</div><br><div>Number of Guests: " +
        numberOfGuests +
        "</div><br><div>Number of Rooms: " +
        numberOfRooms +
        "</div><br><div>Room Type: " +
        roomType +
        "</div><br><div>Purpose: " +
        purpose +
        "</div><br><div>Arrival Date: " +
        getDate(arrivalDate) +
        "</div><br><div>Arrival Time: " +
        arrivalTime +
        "</div><br><div>Departure Date: " +
        getDate(departureDate) +
        "</div><br><div>Departure Time: " +
        departureTime +
        "</div><br><div>Address: " +
        address +
        "</div><br><div>Category: " +
        category +
        "</div>"
    );
    res.status(200).json({
      message:
        "Reservation Request added successfully. Please wait for approval from the admin.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getAllReservationDetails(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this application" });
    }
    console.log("Getting all reservations...");
    const reservations = await Reservation.find();
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateReservation(req, res) {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "CASHIER") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (
      reservation.payment.status === "PAID" &&
      reservation.status === "APPROVED"
    ) {
      reservation.stepsCompleted = 4;
    }

    await reservation.save();
    res.status(200).json({ message: "Reservation Updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
export async function assignReservation(req, res) {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    const reservation = await Reservation.findById(req.params.id);
    reservation.reviewers = req.body.reviewers.map((r) => ({
      role: r,
      status: "PENDING",
      comments: "",
    }));
    await reservation.save();
    res.status(200).json({ message: "Reservation Approved" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getReservationDetails(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (
      req.user.email != reservation.guestEmail &&
      req.user.role !== "ADMIN" &&
      req.user.role !== "CASHIER" &&
      !reservation.reviewers.find((r) => r.role === req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this application" });
    }
    res.status(200).json({ reservation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getReservationDocuments(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (
      req.user.email !== reservation.guestEmail &&
      req.user.role !== "ADMIN" &&
      !reservation.reviewers.find((r) => r.role === req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this application" });
    }
    const archive = archiver("zip");
    res.attachment("files.zip");
    archive.pipe(res);
    for (const fileId of reservation.files) {
      const downloadStream = await getFileById(fileId.refid);
      archive.append(downloadStream, {
        name: `${req.user.email}_${fileId.refid}.${fileId.extension}`,
      });
    }
    const receiptStream = await getFileById(reservation.receipt);
    archive.append(receiptStream, { name: `Receipt_${reservation._id}.pdf` });
    archive.finalize();
    res.on("finish", () => {
      console.log("Download finished");
    });
    // res.status(200).json({ message: "Downloaded successfully" })
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function approveReservation(req, res) {
  try {
    let reservation = await Reservation.findById(req.params.id);
    if (
      req.user.role !== "ADMIN" &&
      !reservation.reviewers.find((r) => r.role === req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    let found = false;
    reservation.reviewers = reservation.reviewers.map((reviewer) => {
      if (reviewer.role === req.user.role) {
        found = true;
        reviewer.status = "APPROVED";
        if (req.body.comments) reviewer.comments = req.body.comments;
      }
      return reviewer;
    });

    if (!found && req.user.role === "ADMIN") {
      reservation.reviewers.push({
        role: req.user.role,
        status: "APPROVED",
        comments: req.body.comments || "",
      });
    }
    let initStatus = reservation.status;
    reservation = await updateReservationStatus(reservation);
    console.log(reservation);
    //add the message to the user model of who made the reservation
    if (initStatus !== reservation.status) {
      console.log(reservation.guestEmail);
      const resUser = await User.findOne({ email: reservation.guestEmail });
      console.log(resUser);
      if (resUser.notifications == null) {
        // console.log()
        resUser.notifications = [];
      }
      // console.log(resUser.notifications)
      resUser.notifications.push({
        message: `Reservation Status changed to ${reservation.status} - ${
          req.body.comments || "No comments"
        }`,
        sender: req.user.role,
        res_id: reservation._id,
      });
      await resUser.save();
    }
    // const body =
    //   "<div>Your reservation has been approved</div><br><div>Comments: " +
    //   req.body.comments +
    //   "</div>";
    // sendVerificationEmail(
    //   reservation.guestEmail,
    //   "Reservation status updated",
    //   body
    // );
    await reservation.save();
    res.status(200).json({ message: "Reservation Approved" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function rejectReservation(req, res) {
  try {
    let reservation = await Reservation.findById(req.params.id);
    if (
      req.user.role !== "ADMIN" &&
      !reservation.reviewers.find((r) => r.role === req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    reservation.reviewers = reservation.reviewers.map((reviewer) => {
      if (reviewer.role === req.user.role) {
        reviewer.status = "REJECTED";
        if (req.body.comments) reviewer.comments = req.body.comments;
      }
      return reviewer;
    });

    if (!found && req.user.role === "ADMIN") {
      reservation.reviewers.push({
        role: req.user.role,
        status: "REJECTED",
        comments: req.body.comments || "",
      });
    }
    let initStatus = reservation.status;
    reservation = await updateReservationStatus(reservation);
    if (initStatus !== reservation.status) {
      const resUser = await User.findOne({ email: reservation.guestEmail });
      if (resUser.notifications == null) {
        // console.log()
        resUser.notifications = [];
      }
      resUser.notifications.push({
        message: `Reservation Status changed to ${reservation.status} - ${
          req.body.comments || "No comments"
        }`,
        sender: req.user.role,
        res_id: reservation._id,
      });
      await resUser.save();
    }

    // const body =
    //   "<div>Your reservation has been rejected</div><br><div>Comments: " +
    //   req.body.comments +
    //   "</div>";
    // sendVerificationEmail(
    //   reservation.guestEmail,
    //   "Reservation status updated",
    //   body
    // );

    await reservation.save();
    res.status(200).json({ message: "Reservation Rejected" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function holdReservation(req, res) {
  try {
    let reservation = await Reservation.findById(req.params.id);
    if (
      req.user.role !== "ADMIN" &&
      !reservation.reviewers.find((r) => r.role === req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    reservation.reviewers = reservation.reviewers.map((reviewer) => {
      if (reviewer.role === req.user.role) {
        reviewer.status = "HOLD";
        if (req.body.comments) reviewer.comments = req.body.comments;
      }
      return reviewer;
    });
    let initStatus = reservation.status;
    reservation = await updateReservationStatus(reservation);

    if (initStatus !== reservation.status) {
      const resUser = await User.findOne({ email: reservation.guestEmail });
      if (resUser.notifications == null) {
        // console.log()
        resUser.notifications = [];
      }
      resUser.notifications.push({
        message: `Reservation Status changed to ${reservation.status} - ${
          req.body.comments || "No comments"
        }`,
        sender: req.user.role,
        res_id: reservation._id,
      });
      await resUser.save();
    }

    // const body =
    //   "<div>Your reservation has been put on hold.</div><br><div>Comments: " +
    //   req.body.comments +
    //   "</div>";
    // sendVerificationEmail(
    //   reservation.guestEmail,
    //   "Reservation status updated",
    //   body
    // );

    await reservation.save();
    res.status(200).json({ message: "Reservation on hold" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export const getPendingReservations = async (req, res) => {
  console.log("Getting pending reservations...");
  try {
    if (req.user.role === "USER") {
      const reservations = await Reservation.find({
        guestEmail: req.user.email,
        status: "PENDING",
      }).sort({
        createdAt: -1,
      });
      return res.status(200).json(reservations);
    } else if (req.user.role !== "ADMIN") {
      const reservations = await Reservation.find({
        reviewers: {
          $elemMatch: {
            role: req.user.role,
            status: "PENDING",
          },
        },
      }).sort({
        createdAt: -1,
      });
      res.status(200).json(reservations);
    } else {
      const reservations = await Reservation.find({ status: "PENDING" }).sort({
        createdAt: -1,
      });
      res.status(200).json(reservations);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getApprovedReservations = async (req, res) => {
  console.log("Getting approved reservations...");
  try {
    if (req.user.role === "USER") {
      const reservations = await Reservation.find({
        guestEmail: req.user.email,
        status: "APPROVED",
      }).sort({
        createdAt: -1,
      });
      return res.status(200).json(reservations);
    } else if (req.user.role === "ADMIN") {
      const reservations = await Reservation.find({
        status: "APPROVED",
      }).sort({
        createdAt: -1,
      });
      res.status(200).json(reservations);
    } else {
      const reservations = await Reservation.find({
        reviewers: {
          $elemMatch: {
            role: req.user.role,
            status: "APPROVED",
          },
        },
      }).sort({
        createdAt: -1,
      });
      res.status(200).json(reservations);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRejectedReservations = async (req, res) => {
  console.log("Getting rejected reservations...");
  try {
    if (req.user.role === "USER") {
      const reservations = await Reservation.find({
        guestEmail: req.user.email,
        status: "REJECTED",
      }).sort({
        createdAt: -1,
      });
      return res.status(200).json(reservations);
    } else if (req.user.role === "ADMIN") {
      const reservations = await Reservation.find({
        status: "REJECTED",
      }).sort({
        createdAt: -1,
      });
      res.status(200).json(reservations);
    } else {
      const reservations = await Reservation.find({
        reviewers: {
          $elemMatch: {
            role: req.user.role,
            status: "REJECTED",
          },
        },
      }).sort({
        createdAt: -1,
      });
      res.status(200).json(reservations);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    reservation.payment.status = req.body.status;
    reservation.payment.amount = req.body.amount;
    reservation.payment.payment_method = req.body.payment_method;
    reservation.payment.transaction_id = req.body.transaction_id;
    console.log(reservation);
    console.log("Updated the payment status");
    await reservation.save();
    res.status(200).json({ message: "Payment status updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReservationStatus = async (reservation) => {
  let initStatus = reservation.status;
  let reviewers = reservation.reviewers;
  const userEmail = reservation.guestEmail;

  let isApproved = false;
  let isRejected = false;
  let adminStatus;
  reviewers.forEach((reviewer) => {
    if (reviewer.role === "ADMIN") {
      adminStatus = reviewer.status;
    } else {
      if (reviewer.status === "APPROVED") {
        isApproved = true;
      }
      if (reviewer.status === "REJECTED") {
        isRejected = true;
      }
    }
  });
  if (adminStatus === "APPROVED") {
    isApproved = true;
  } else if (adminStatus === "REJECTED") {
    isRejected = true;
  }

  if (isRejected) {
    reservation.status = "REJECTED";
  } else if (isApproved) {
    reservation.status = "APPROVED";
  } else {
    reservation.status = "PENDING";
  }
  if (reservation.status === "APPROVED") {
    reservation.stepsCompleted = 2;
  } else {
    reservation.stepsCompleted = 1;
  }
  if (initStatus !== reservation.status) {
    try {
      const user = await User.findOne({ email: userEmail });
      if (user) {
        if (
          reservation.status === "APPROVED" ||
          reservation.status === "REJECTED"
        ) {
          user.pendingRequest = user.pendingRequest - 1;
        } else {
          user.pendingRequest = user.pendingRequest + 1;
        }

        // Save the updated user document
        await user.save();
      } else {
        console.log("User not found");
      }
    } catch (err) {
      console.log("Error updating user:", err);
    }
  }
  return reservation;
};

export const getRooms = async (req, res) => {
  if (req.user?.role !== "ADMIN")
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    console.log("Rooms", rooms);
    res.status(200).json(rooms);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const addRoom = async (req, res) => {
  if (req.user?.role !== "ADMIN")
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
  try {
    const roomNumber = req.body.roomNumber;
    const newRoom = await Room.create({ roomNumber: roomNumber });
    res.status(200).json({ message: "Room added Successfully", room: newRoom });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  if (req.user?.role !== "ADMIN")
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });

  try {
    const { roomId } = req.body;

    const deletedRoom = await Room.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res
      .status(200)
      .json({ message: "Room deleted successfully", room: deletedRoom });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function isDateRangeAvailable(room, startDate, endDate) {
  for (const booking of room.bookings) {
    const bookingStartDate = new Date(booking.startDate).toISOString();
    const bookingEndDate = new Date(booking.endDate).toISOString();

    if (room.roomNumber == 108) {
      console.log(bookingStartDate, bookingEndDate, startDate, endDate);
    }
    // Check for intersection
    if (bookingStartDate < endDate && bookingEndDate > startDate) {
      if (room.roomNumber == 108) console.log("Intersection");
      return false; // Date range intersects with existing booking
    }
  }

  if (room.roomNumber == 108) console.log("No intersection");

  return true; // Date range is available
}

// Function to update rooms and reservation
export const updateRooms = async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const allottedRooms = req.body;
    const id = req.params.id;
    const prevRes = await Reservation.findById(id);
    const prevAllottedRooms = prevRes.bookings;
    for (const prevAllottedRoom of prevAllottedRooms) {
      const room = await Room.findOne({
        roomNumber: prevAllottedRoom.roomNumber,
      });
      if (!room) {
        throw new Error(
          `Room with number ${prevAllottedRoom.roomNumber} not found`,
          400
        );
      }
      const bookingIndex = room.bookings.findIndex(
        (booking) =>
          getDate(booking.startDate) == getDate(prevAllottedRoom.startDate) &&
          getDate(booking.endDate) == getDate(prevAllottedRoom.endDate)
      );
      if (bookingIndex !== -1) {
        room.bookings.splice(bookingIndex, 1);
      }
      await room.save();
    }
    for (const allottedRoom of allottedRooms) {
      const { roomNumber, startDate, endDate } = allottedRoom;

      const room = await Room.findOne({ roomNumber });
      if (!room) {
        throw new Error(`Room with number ${roomNumber} not found`, 400);
      }

      const isAvailable = await isDateRangeAvailable(room, startDate, endDate);

      if (isAvailable) {
        // Update the room bookings to mark the specified period as booked
        room.bookings.push({
          startDate: allottedRoom.startDate,
          endDate: allottedRoom.endDate,
          user: allottedRoom.user,
        });
      }

      await room.save();

      // Update the reservation document to reflect the assigned rooms for the user
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id, // Assuming user has an _id property
      { $set: { bookings: allottedRooms, stepsCompleted: 3 } },
      { session }
    );

    if (!reservation) {
      throw new Error("Failed to update reservation", 400);
    }
    await session.commitTransaction();
    session.endSession();
    res
      .status(200)
      .json({ message: "Rooms and reservation updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating rooms and reservation:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendNotification = async (req, res) => {
  try {
    if (req.user.role === "USER") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    const { message, sender, res_id } = req.body;
    sender = req.user.role;
    const user = await User.findById(req.params.id);
    user.notifications.push({ message, sender, res_id });
    await user.save();
    res.status(200).json({ message: "Notification sent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCurrentReservations = async (req, res) => {
  try {
    if (req.user.role !== "CASHIER")
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    const reservations = await Reservation.find({
      departureDate: { $gte: new Date() },
      status: "APPROVED",
    });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getPaymentPendingReservations = async (req, res) => {
  try {
    if (req.user.role !== "CASHIER")
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    const reservations = await Reservation.find({
      // departureDate: { $gte: new Date() },
      "payment.status": "PENDING",
      status: "APPROVED",
    });
    console.log(reservations);
    res.status(200).json(reservations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getCheckedOutReservations = async (req, res) => {
  try {
    if (req.user.role !== "CASHIER")
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    const reservations = await Reservation.find({
      checkOut: true,
    });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLateCheckoutReservations = async (req, res) => {
  try {
    if (req.user.role !== "CASHIER")
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    const reservations = await Reservation.find({
      departureDate: { $lt: new Date() },
      status: "APPROVED",
      checkOut: false,
    });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const checkoutReservation = async (req, res) => {
  try {
    if (req.user.role !== "CASHIER")
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });

    const { id } = req.params;
    const reservation = await Reservation.findById(id);
    if (reservation.payment.status !== "PAID") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    reservation.checkOut = true;
    await reservation.save();
    console.log("check res:", reservation);
    res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const checkoutToday = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for the start of today

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Set hours, minutes, seconds, and milliseconds to the end of today

    const reservations = await Reservation.find({
      departureDate: { $gt: new Date(), $lte: todayEnd },
      status: "APPROVED",
      checkOut: false,
    });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDiningAmount = async (req, res) => {
  try {
    const { id } = req.body;
    const reservation = await Reservation.findById(id);
    const diningIds = reservation.diningIds;
    let totalAmount = 0;
    if (diningIds.length > 0) {
      const meals = await Meal.find({
        _id: { $in: diningIds },
      });
      totalAmount = meals.reduce((accumulator, currentObject) => {
        return accumulator + currentObject.amount;
      }, 0);
    }
    res.status(200).json({ totalAmount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
