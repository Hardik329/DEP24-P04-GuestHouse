import React from "react";
import HomePage from "./pages/HomePage";
import Home from "./pages/Home";
import People from "./pages/People";
import Location from "./pages/Location";
import Reservation from "./pages/Reservation";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import PDFViewer from "./components/PDFViewer";
import ReservationForm from "./pages/Reservation_Form";
import RecordList from "./components/RecordList";
import BookDining from "./pages/BookDining";
import UserList from "./components/UserList";
import Cart from "./pages/Cart";
import RecordPage from "./pages/RecordPage";
import AdminRecordList from "./components/AdminRecordList";
import DiningList from "./components/DiningList";
import DiningRecordPage from "./pages/DiningRecordPage";
import Auth from "./utils/Auth";
import Dining from "./pages/Dining";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import RoomBooking from "./pages/RoomBooking";
import AdminRecordPage from "./pages/AdminRecordPage";
import AddRoom from "./components/AddRoom";

function App() {
  return (
    <div className="font-['Dosis']">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<HomePage />}>
            <Route path="/" element={<Home />} />
            <Route path="/people" element={<People />} />
            <Route path="/location" element={<Location />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="admin" element={<Auth allowedRoles={["ADMIN"]} />}>
            <Route path="dining" element={<Dining />}>
              <Route path="" element={<DiningList />} />
              <Route
                path="rejected-requests"
                element={<DiningList status="rejected" />}
              />
              <Route
                path="approved-requests"
                element={<DiningList status="approved" />}
              />
              <Route path="book-dining" element={<BookDining />} />
              <Route path="cart" element={<Cart />} />
              <Route path=":id" element={<DiningRecordPage />} />
            </Route>

            <Route path="reservation" element={<Reservation />}>
              <Route path="" element={<AdminRecordList status="approved" />} />
              <Route path="pending-requests" element={<AdminRecordList />} />
              <Route path="reservation-form" element={<ReservationForm />} />


              <Route path="users" element={<UserList />} />
              <Route path="rooms" element={<AddRoom />} />
              <Route path=":id/rooms" element={<RoomBooking />} />
              <Route path=":id" element={<AdminRecordPage />} />

            </Route>
          </Route>

          <Route path="cashier" element={<Auth allowedRoles={["CASHIER"]} />}>
            <Route path="reservation" element={<Reservation />}>
              <Route path="" element={<RecordList desc="current-requests" />} />
              <Route
                path="payment-pending"
                element={<RecordList payment={false} desc="payment-pending" />}
              />
              <Route
                path="late-checkout"
                element={<RecordList checkout="late" desc="late-checkout" />}
              />
              <Route
                path="checked-out"
                element={<RecordList checkout="done" desc="checked-out" />}
              />
              <Route
                path="checkout-today"
                element={<RecordList checkout="today" desc="checkout-today" />}
              />
              <Route path=":id" element={<RecordPage />} />
            </Route>

            <Route path="dining" element={<Dining />}>
              <Route
                path=""
                element={<DiningList source="Guest" paymentstatus={false} />}
              />
              <Route
                path="payment-pending-guest"
                element={
                  <DiningList
                    status="approved"
                    source="Guest"
                    paymentstatus={false}
                  />
                }
              />
              <Route
                path="payment-pending-department"
                element={
                  <DiningList
                    status="approved"
                    source="Department"
                    paymentstatus={false}
                  />
                }
              />
              <Route
                path="payment-done-guest"
                element={
                  <DiningList
                    status="approved"
                    source="Guest"
                    paymentstatus={true}
                  />
                }
              />
              <Route
                path="payment-done-department"
                element={
                  <DiningList
                    status="approved"
                    source="Department"
                    paymentstatus={true}
                  />
                }
              />
              <Route path=":id" element={<DiningRecordPage />} />
            </Route>
          </Route>

          <Route path="user" element={<Auth allowedRoles={["USER"]} />}>
            <Route path="reservation" element={<Reservation />}>
              <Route path="pending-requests" element={<RecordList />} />
              <Route path="" element={<RecordList status="approved" />} />
              <Route
                path="rejected-requests"
                element={<RecordList status="rejected" />}
              />
              <Route path="reservation-form" element={<ReservationForm />} />
              <Route path=":id" element={<RecordPage />} />
            </Route>
            <Route path="dining" element={<Dining />}>
              <Route path="" element={<DiningList />} />
              <Route
                path="rejected-requests"
                element={<DiningList status="rejected" />}
              />
              <Route
                path="approved-requests"
                element={<DiningList status="approved" />}
              />
              <Route path="book-dining" element={<BookDining />} />
              <Route path="cart" element={<Cart />} />
              <Route path=":id" element={<DiningRecordPage />} />
            </Route>
          </Route>

          <Route
            path=":role"
            element={
              <Auth
                allowedRoles={[
                  "HOD COMPUTER SCIENCE",
                  "HOD ELECTRICAL ENGINEERING",
                  "HOD MECHANICAL ENGINEERING",
                  "HOD CHEMISTRY",
                  "HOD MATHEMATICS",
                  "HOD PHYSICS",
                  "HOD HUMANITIES AND SOCIAL SCIENCES",
                  "HOD BIOMEDICAL ENGINEERING",
                  "HOD CIVIL ENGINEERING",
                  "HOD CHEMICAL ENGINEERING",
                  "HOD METALLURGICAL AND MATERIALS ENGINEERING",
                  "CHAIRMAN",
                  "DIRECTOR",
                  "DEAN RESEARCH AND DEVELOPMENT",
                  "DEAN STUDENT AFFAIRS",
                  "DEAN FACULTY AFFAIRS AND ADMINISTRATION",
                  "DEAN UNDER GRADUATE STUDIES",
                  "DEAN POST GRADUATE STUDIES",
                  "REGISTRAR",
                  "ASSOCIATE DEAN HOSTEL MANAGEMENT",
                  "ASSOCIATE DEAN INTERNATIONAL RELATIONS AND ALUMNI AFFAIRS",
                  "ASSOCIATE DEAN CONTINUING EDUCATION AND OUTREACH ACTIVITIES",
                  "ASSOCIATE DEAN INFRASTRUCTURE",
                ]}
              />
            }
          >
            <Route path="dining" element={<Dining />}>
              <Route path="" element={<DiningList />} />
              <Route path="book-dining" element={<BookDining />} />
              <Route
                path="rejected-requests"
                element={<DiningList status="rejected" />}
              />
              <Route
                path="approved-requests"
                element={<DiningList status="approved" />}
              />
              <Route path="cart" element={<Cart />} />
              <Route path=":id" element={<DiningRecordPage />} />
            </Route>

            <Route path="reservation" element={<Reservation />}>
              <Route path="pending-requests" element={<AdminRecordList />} />
              <Route
                path="rejected-requests"
                element={<AdminRecordList status="rejected" />}
              />
              <Route path="" element={<AdminRecordList status="approved" />} />
              <Route path=":id" element={<AdminRecordPage />} />

              <Route path="users" element={<UserList />} />
              <Route path=":id/rooms" element={<RoomBooking />} />
            </Route>
          </Route>

          <Route path="reservation" element={<Reservation />}>
            <Route path="" element={<RecordList />} />
            <Route path="reservation-form" element={<ReservationForm />} />
            <Route path=":id" element={<RecordPage />} />
          </Route>

          <Route path="dining" element={<Dining />}>
            <Route path="" element={<DiningList />} />
            <Route path="book-dining" element={<BookDining />} />
            <Route path="cart" element={<Cart />} />
            <Route path=":id" element={<DiningRecordPage />} />
          </Route>

          <Route path="/iitropar-campus-map" element={<PDFViewer />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/unknown/*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
