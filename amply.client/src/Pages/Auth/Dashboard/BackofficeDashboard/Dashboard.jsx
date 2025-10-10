import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  Calendar,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Zap,
  Battery,
} from "lucide-react";

import HomePage from "./HomePage";
import ReservationList from "../../../Reservation/ReservationList";
import ChargingStationDashboard from "../../../ChargingStationManagement/ChargingStationDashboard";
import UserProfileList from "../../../UserProfile/UserProfileList";
import DashboardNavbar from "./DashboardNavbar";

export default function BackOfficeDashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const location = useLocation();

  useEffect(() => {
    const state = location.state;
    if (state && state.activeNav) setActiveNav(state.activeNav);
  }, [location.state]);

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "reservation", label: "Reservation", icon: MapPin },
    { id: "ev-stations", label: "EV Stations", icon: Battery },
    { id: "owners", label: "EV Owners", icon: Users },
    // { id: "reports", label: "Reports", icon: BarChart3 },
    // { id: "settings", label: "Settings", icon: Settings },
  ];

  const recentBookings = [];
  const chargingStations = [];
  const recentOwners = [];

  const renderContent = () => {
    switch (activeNav) {
      case "home":
        return (
          <HomePage
            recentBookings={recentBookings}
            chargingStations={chargingStations}
            recentOwners={recentOwners}
          />
        );
      case "reservation":
        return <ReservationList />;
      case "ev-stations":
        return <ChargingStationDashboard />;
      case "owners":
        return <UserProfileList />;
      default:
        return (
          <HomePage
            recentBookings={recentBookings}
            chargingStations={chargingStations}
            recentOwners={recentOwners}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col shadow-xl sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow">
            <Zap className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Amply</h1>
            <p className="text-sm text-gray-400">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeNav === item.id
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-inner"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Fixed Top Navbar */}
        <div className="fixed top-0 left-64 right-0 z-20">
          <DashboardNavbar />
        </div>

        {/* Page Content */}
        <div className="pt-24 px-6 pb-6">
          <div className="space-y-6">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}
