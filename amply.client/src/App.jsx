import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Auth/Dashboard";
import ReservationList from "./Pages/Reservation/ReservationList";
import ReservationForm from "./Pages/Reservation/ReservationForm";
import { ChargingStationDashboard, ChargingStationList, ChargingStationForm, ScheduleManagement } from "./Pages/ChargingStationManagement";

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
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Reservation Routes */}
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/reservation/new" element={<ReservationForm />} />
        <Route path="/reservation/edit/:id" element={<ReservationForm />} />

        {/* Charging Station Management Routes */}
        <Route path="/charging-stations" element={<ChargingStationDashboard />} />
        <Route path="/charging-stations/list" element={<ChargingStationList />} />
        <Route path="/charging-stations/new" element={<ChargingStationForm />} />
        <Route path="/charging-stations/edit/:id" element={<ChargingStationForm />} />
        <Route path="/charging-stations/schedule/:id" element={<ScheduleManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
