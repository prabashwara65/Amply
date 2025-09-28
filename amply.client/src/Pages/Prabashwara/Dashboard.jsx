import React from "react";

export default function Dashboard() {
  const email = localStorage.getItem("email"); // optional: show logged-in user
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {email && <p className="text-gray-700 mb-4">Welcome, {email}</p>}
        <p className="text-gray-500">This is your dashboard. No protected route is used.</p>
      </div>
    </div>
  );
}
