import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Auth/Dashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Reservation Routes */}
        <Route path="/reservations" element={<ReservationList />} />
        <Route path="/reservation/new" element={<ReservationForm />} />
        <Route path="/reservation/edit/:id" element={<ReservationForm />} />
      </Routes>
    </Router>
  );
}

export default App;
