import mongoose from "mongoose";
// import Counter from "./Counter.js";
import Counter from "./Counter.js";
const reservationSchema = new mongoose.Schema(
  {
    srno: {
      type: Number,
      // required: true,
      unique: true,
    },
    guestEmail: {
      type: String,
      required: true,
      trim: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
    },
    numberOfRooms: {
      type: Number,
      required: true,
    },
    roomType: {
      type: String,

      enum: ["Single Occupancy", "Double Occupancy"], // Assuming only two types for simplicity
    },
    arrivalDate: {
      type: Date,
    },
    departureDate: {
      type: Date,
    },
    purpose: {
      type: String,
    },
    category: {
      type: String,
      enum: ["A", "B", "C", "D"], // Assuming only three types for simplicity
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "HOLD"],
      default: "PENDING",
    },
    stepsCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
    reviewers: [
      {
        role: {
          type: String,
          enum: [
            "ADMIN",
            "HOD",
            "CHAIRMAN",
            "DIRECTOR",
            "DEAN",
            "REGISTRAR",
            "ASSOCIATE DEAN",
          ],
        },
        comments: {
          type: String,
        },
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED", "HOLD"],
          default: "PENDING",
        },
      },
    ],
    address: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    files: [
      {
        refid: {
          type: String,
          required: true,
        },
        extension: {
          type: String,
          required: true,
        },
      },
    ],
    bookings: [
      {
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        roomNumber: {
          type: Number,
          required: true,
        },
      },
    ],
    payment: {
      source: {
        type: String,
        enum: ["GUEST", "DEPARTMENT", "OTHERS"],
        required: true,
        default: "GUEST",
      },
      status: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING",
      },
      billRaised: {
        type: Boolean,
        default: true,
      },
      amount: {
        type: Number,
        // required:true,
      },
      paymentId: {
        type: String,
      },
    },
    checkOut: {
      type: Boolean,
      default: false,
    },
    applicant: {
      name: {
        type: String,
        required: true,
      },
      designation: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    diningIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// reservationSchema.post("save", async function (doc) {
//   if (doc.status === "APPROVED") {
//     // Send notification to guest
//     //change the number of pending requests for the user
//     // sendNotification(doc.guestEmail, "Your reservation has been approved");
//   }
//   console.log(doc.srno);
// });

//another one when we create a new object
reservationSchema.pre("save", async function (next) {
  // Get the next sequence value
  try {
    if (this.isNew) {
      const nextSequence = await Counter.getNextSequence("reservation");
      this.srno = nextSequence;
      console.log("Got the next sequence value: ", this.srno);
    }
    console.log("saving the reservation");
    next();
  } catch (e) {
    next(e);
    console.log(e);
  }
  // Send notification to admin
  // sendNotification(ADMIN_EMAIL, "A new reservation has been created");
});
// reservationSchema.plugin(autoIncrement.plugin, {
//   model: "Reservation",
//   field: "srno",
//   startAt: 1,
//   incrementBy: 1,
// });
const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
