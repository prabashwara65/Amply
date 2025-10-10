import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import BackofficeDashboard from "./Pages/Auth/Dashboard/BackofficeDashboard/Dashboard";
import ElectiveVehicleDashboard from "./Pages/Auth/Dashboard/ElectiveVehicleDashboard/Dashboard";
import ReservationList from "./Pages/Reservation/ReservationList";
import ReservationForm from "./Pages/Reservation/ReservationForm";
import { ChargingStationDashboard, ChargingStationList, ScheduleManagement } from "./Pages/ChargingStationManagement";
import StationDetails from "./Pages/ChargingStationManagement/StationDetails";
import UserProfileList from "./Pages/UserProfile/UserProfileList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      {/* ToastContainer must be outside Routes */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bodashboard" element={<BackofficeDashboard />} />
        <Route path="/evdashboard" element={<ElectiveVehicleDashboard />} />
          

        {/* Reservation Routes */}
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/reservation/new" element={<ReservationForm />} />
        <Route path="/reservation/edit/:id" element={<ReservationForm />} />

        {/* Charging Station Management Routes */}
        <Route path="/charging-stations" element={<ChargingStationDashboard />} />
        <Route path="/charging-stations/list" element={<ChargingStationList />} />
        <Route path="/charging-stations/details/:id" element={<StationDetails />} />
        <Route path="/charging-stations/schedule/:id" element={<ScheduleManagement />} />

        {/* EV Owner Profile Routes */}
        <Route path="/user-profile/list" element={<UserProfileList />} />
        
      </Routes>
    </Router>
  );
}

export default App;
