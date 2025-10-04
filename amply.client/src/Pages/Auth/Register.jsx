import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../Services/authService";
import LoginGreeting from "../../Components/LoginGreeting"; // reuse greeting component

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await register({
        FullName: fullName,
        Email: email,
        Password: password,
        ConfirmPassword: confirmPassword,
      });
      console.log(res.data);
      setMessage("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      setMessage(
        err.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : err.message
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image - 75% */}
      <div
        className="hidden md:flex w-3/4 bg-cover bg-center relative"
        style={{ backgroundImage: 'url("/assets/img1.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Right Form - 25% */}
      <div className="flex w-full h-auto md:w-1/4 items-start justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full p-6 space-y-6">

       
          {/* Registration Form */}
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              type="password"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition font-semibold"
            >
              Register
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center ${
                message === "Registration successful!"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/")}
            >
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
