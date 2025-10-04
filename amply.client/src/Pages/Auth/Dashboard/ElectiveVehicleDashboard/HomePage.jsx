// src/Pages/Auth/DashboardPages/HomePage.jsx
import React from "react"
import { ChevronRight, Zap, MapPin, Calendar, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react"

export default function HomePage({ operatorName = "Operator" }) {
  const todayBookings = [
    { id: 1, owner: "Sarah Johnson", station: "Downtown Station A", time: "10:00 AM", status: "confirmed" },
    { id: 2, owner: "Michael Chen", station: "Mall Parking B", time: "2:30 PM", status: "pending" },
    { id: 3, owner: "Emma Williams", station: "Airport Station C", time: "8:00 AM", status: "confirmed" },
  ]

  const assignedStations = [
    { name: "Downtown Station A", location: "City Center", slots: 4, available: 3, type: "DC Fast" },
    { name: "Mall Parking B", location: "Shopping District", slots: 6, available: 2, type: "AC/DC" },
    { name: "Airport Station C", location: "Airport Zone", slots: 8, available: 5, type: "DC Fast" },
  ]

  const managedOwners = [
    { name: "David Brown", nic: "199645678901", registered: "Sep 28", status: "active" },
    { name: "Lisa Anderson", nic: "199756789012", registered: "Sep 27", status: "active" },
    { name: "James Wilson", nic: "198867890123", registered: "Sep 26", status: "pending" },
  ]

  const todaysStats = {
    "Confirmed Bookings": 20,
    "Pending Approvals": 5,
    "Slots Available": 10,
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(todaysStats).map(([key, value]) => (
          <div key={key} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">{key}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Bookings */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Today's Bookings</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {todayBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300">
                <div>
                  <p className="font-medium text-gray-900 mb-1">{booking.owner}</p>
                  <p className="text-sm text-gray-600">{booking.station}</p>
                  <p className="text-xs text-gray-500">{booking.time}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${booking.status === "confirmed" ? "bg-green-600 text-white" : "bg-yellow-200 text-yellow-800 border border-yellow-300"}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Station Status */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Station Status</h3>
          </div>
          <div className="p-6 space-y-3">
            {assignedStations.map((station, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{station.name}</p>
                    <p className="text-xs text-gray-500">{station.location}</p>
                  </div>
                  {station.available === 0 ? <AlertCircle className="w-4 h-4 text-gray-400" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: station.slots }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < station.available ? "bg-green-600" : "bg-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{station.available}/{station.slots} slots available</p>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-white px-2 py-1 rounded border border-gray-200 inline-block">{station.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Managed EV Owners */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Managed EV Owners</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {managedOwners.map((owner) => (
              <div key={owner.nic} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <span className="text-sm font-medium text-white">{owner.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{owner.name}</p>
                    <p className="text-xs text-gray-500">NIC: {owner.nic}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${owner.status === "active" ? "bg-green-600 text-white" : "bg-yellow-200 text-yellow-800 border border-yellow-300"}`}>{owner.status}</span>
                  <p className="text-xs text-gray-500 mt-1">{owner.registered}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
