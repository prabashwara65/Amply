import React, { useState } from "react"
import { Home, MapPin, Calendar, Users, UserCog, BarChart3, Settings, Zap } from "lucide-react"
import HomePage from "../Dashboard/HomePage"
import ReservationList from "../../Reservation/ReservationList"
import ChargingStations from "../Dashboard/ChargingStations"
// import Bookings from "./DashboardPages/Bookings"

export default function BackOfficeDashboard() {
  const [activeNav, setActiveNav] = useState("home")

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "reservation", label: "Reservation", icon: MapPin },
    { id: "bookings", label: "Booking Management", icon: Calendar },
    { id: "owners", label: "EV Owners", icon: Users },
    { id: "operators", label: "Station Operators", icon: UserCog },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Dummy data for Home
  const recentBookings = [/* same as before */]
  const chargingStations = [/* same as before */]
  const recentOwners = [/* same as before */]

  const renderContent = () => {
    switch (activeNav) {
      case "home":
        return <HomePage recentBookings={recentBookings} chargingStations={chargingStations} recentOwners={recentOwners} />
      case "reservation":
        return <ReservationList />
      // case "bookings":
      //   return <Bookings />
      default:
        return <HomePage recentBookings={recentBookings} chargingStations={chargingStations} recentOwners={recentOwners} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 p-6 flex flex-col shadow-xl">
        {/* Sidebar Logo & User Info */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">EV Charge</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-8 p-3 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">AD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">Back Office</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeNav === item.id
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{renderContent()}</main>
    </div>
  )
}
