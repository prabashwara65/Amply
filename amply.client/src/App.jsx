import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Prabashwara/Register";
import Login from "./Pages/Prabashwara/Login";
import Dashboard from "./Pages/Prabashwara/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
