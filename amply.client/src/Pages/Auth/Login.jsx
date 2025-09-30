import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../Services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await login(form);

      // Save token, email, and role in localStorage
      const { accessToken, email, role } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("email", email);
      // role might be empty
      localStorage.setItem("role", role || ""); 

      setMessage("Login Successful");

      // Redirect based on role
      if (role === "Backofficer") {
        navigate("/dashboard");
      } else if (role === "StationOperator") {
        navigate("/operator-dashboard");
      } else {
        navigate("/"); 
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message === "Login Successful" ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
