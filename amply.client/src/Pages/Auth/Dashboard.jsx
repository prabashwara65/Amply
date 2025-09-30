import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const email = localStorage.getItem("email"); 
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-gray-800">MyApp</h1>
                        </div>
                        <div className="hidden md:flex space-x-4">
                            <a href="#" className="text-gray-700 hover:text-blue-600">
                                Home
                            </a>
                            <a href="/reservations" className="text-gray-700 hover:text-blue-600">
                                Reservation
                            </a>
                            <a href="#" className="text-gray-700 hover:text-blue-600">
                                Profile
                            </a>
                            <a href="#" className="text-gray-700 hover:text-blue-600">
                                Settings
                            </a>
                        </div>
                        <div className="md:hidden">
                            {/* Mobile menu button can go here */}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Welcome to Your Dashboard
                    </h2>
                    {email && (
                        <p className="text-lg text-gray-700 mb-6">Hello, {email}!</p>
                    )}
                    <p className="text-gray-600 mb-8">
                        Manage your projects, track progress, and explore insights in one place.
                    </p>
                    <a
                        href="#"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Get Started
                    </a>
                </div>
            </section>

            {/* Main Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h3 className="text-2xl font-bold mb-4">Dashboard Overview</h3>
                    <p className="text-gray-500">
                        Your personalized data and insights will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
}
