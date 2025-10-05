import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../Services/authService";
import LoginGreeting from "../../Components/LoginGreeting";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await login(form);
      const { accessToken, email, role } = res.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role || "");

      setMessage("Login Successful");

      if (role === "Backofficer") navigate("/bodashboard");
      else if (role === "EvOperator") navigate("/evdashboard");
      else navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image - 75% */}
      <div
        className="hidden md:flex w-3/4 bg-cover bg-center relative"
        style={{ backgroundImage: 'url("/assets/img2.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
          {/* <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-lg max-w-lg">Manage Amply station with Electic Vehicle Owners</p> */}
        </div>
      </div>

      {/* Right Form - 25% */}
      <div className="flex w-full h-auto md:w-1/4 items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full h-full p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition font-semibold"
            >
              Login
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center ${
                message === "Login Successful" ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </p>
          <LoginGreeting />
        </div>
        
      </div>
    </div>
  );
}
