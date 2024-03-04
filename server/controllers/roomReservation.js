import Reservation from "../models/reservationModel.js";

export async function createReservation(req, res) {
  try {
    //user details are contained in req.body.user
    
    const {numberOfGuests,numberOfRooms,roomType,arrivalDate,departureDate,email,category,address,description}=req.body;
    const name=req.body.user.name;
    console.log(req.body);
    await Reservation.create({
      guestEmail: email,
      numberOfGuests,
      numberOfRooms,
      roomType,
      arrivalDate,
      departureDate,
      guestName: name,
      status: "PENDING",
      description: description,
      category: category,
      address: address,
    });
    res
      .status(200)
      .json({
        message:
          "Reservation Request added successfully. Please wait for approval from the admin.",
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getAllReservationDetails(req, res) {
  try {
    if (req.body.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this application" });
    }
    console.log("Getting all reservations...")
    const reservations = await Reservation.find();
    res.status(200).json( reservations );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getReservationDetails(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (
      req.body.user.email != reservation.guestEmail &&
      req.body.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this application" });
    }
    res.status(200).json({
      user: reservation.guestEmail,
      status: reservation.status,
      approvals: reservation.approvals,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function approveReservation(req, res) {
  if (req.body.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
  }
  try {
    const reservation = await Reservation.findById(req.params.id);
    reservation.status = "APPROVED";
    reservation.approvals.push(req.body.user._id);
    await reservation.save();
    res.status(200).json({ message: "Reservation Approved" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
