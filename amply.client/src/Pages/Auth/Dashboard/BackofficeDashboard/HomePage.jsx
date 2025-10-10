// src/Pages/Auth/DashboardPages/HomePage.jsx
import React, {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom";
import { ChevronRight, Zap, MapPin, Calendar, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react"
import { getUserProfiles } from "../../../../Services/UserProfileService/userProfileService";

export default function HomePage() {
  const navigate = useNavigate();
  const [managedOwners, setManagedOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recentBookings = [
    { id: 1, owner: "Sarah Johnson", nic: "199512345678", station: "Downtown Station A", date: "Oct 2, 2025", time: "10:00 AM", status: "confirmed" },
    { id: 2, owner: "Michael Chen", nic: "198823456789", station: "Mall Parking B", date: "Oct 2, 2025", time: "2:30 PM", status: "pending" },
    { id: 3, owner: "Emma Williams", nic: "200134567890", station: "Airport Station C", date: "Oct 3, 2025", time: "8:00 AM", status: "confirmed" },
  ]

  const chargingStations = [
    { name: "Downtown Station A", location: "City Center", slots: 4, available: 3, type: "DC Fast" },
    { name: "Mall Parking B", location: "Shopping District", slots: 6, available: 2, type: "AC/DC" },
    { name: "Airport Station C", location: "Airport Zone", slots: 8, available: 5, type: "DC Fast" },
    { name: "City Center D", location: "Business District", slots: 4, available: 0, type: "AC Standard" },
  ]

  // fetch registered owners list
  useEffect(() => {
      const fetchOwners = async () => {
        try {
          const response = await getUserProfiles();
          const owners = response.data || [];
          setManagedOwners(owners);
        } catch (err) {
          console.error("Error fetching user profiles:", err);
          setError("Failed to load owners");
        } finally {
          setLoading(false);
        }
      };
      fetchOwners();
    }, []);

  const todaysOverview = {
    pendingSessions: 12,
    stats: {
      "Completed Sessions": 32,
      "Slot Utilization": 78,
      "New Registrations": 8,
    },
    percentages: {
      "Completed Sessions": 68,
      "Slot Utilization": 78,
      "New Registrations": 40,
    },
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">4</p>
          <p className="text-sm text-gray-600">Total Stations</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Today</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">3</p>
          <p className="text-sm text-gray-600">Active Bookings</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">12</p>
          <p className="text-sm text-gray-600">Pending Approvals</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Registered</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">3</p>
          <p className="text-sm text-gray-600">EV Owners</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Recent Bookings</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{booking.owner}</p>
                    <p className="text-sm text-gray-600">{booking.station}</p>
                    <p className="text-xs text-gray-500">{booking.date} • {booking.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${booking.status === "confirmed" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700 border border-gray-300"}`}>
                    {booking.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">NIC: {booking.nic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station Status */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Station Status</h3>
          </div>
          <div className="p-6 space-y-3">
            {chargingStations.map((station, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{station.name}</p>
                    <p className="text-xs text-gray-500">{station.location}</p>
                  </div>
                  {station.available === 0 ? <AlertCircle className="w-4 h-4 text-gray-400" /> : <CheckCircle2 className="w-4 h-4 text-gray-900" />}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: station.slots }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < station.available ? "bg-gray-900" : "bg-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{station.available}/{station.slots} free</p>
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
                    <button
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                      onClick={() => navigate("/evdashboard/user-profile/list")}
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
        
                  <div className="p-6 space-y-3">
                    {loading && <p className="text-sm text-gray-500">Loading owners...</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
        
                    {!loading && managedOwners.length === 0 && (
                      <p className="text-sm text-gray-500">No owners found.</p>
                    )}
        
                    {managedOwners.slice(0, 5).map((owner) => (
                      <div
                        key={owner.nic || owner.NIC}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-200">
                            <span className="text-sm font-medium text-white">
                              {owner.fullName
                                ? owner.fullName.split(" ").map((n) => n[0]).join("")
                                : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{owner.fullName}</p>
                            <p className="text-xs text-gray-500">NIC: {owner.nic || owner.NIC}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              owner.status === "active"
                                ? "bg-green-600 text-white"
                                : owner.status === "deactive"
                                ? "bg-gray-300 text-gray-700"
                                : "bg-yellow-200 text-yellow-800 border border-yellow-300"
                            }`}
                          >
                            {owner.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {owner.createdAt
                              ? new Date(owner.createdAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>

        {/* Today's Overview */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Today's Overview</h3>
          </div>
          <div className="p-6 space-y-6">
            {Object.entries(todaysOverview.stats).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gray-900 h-2.5 rounded-full shadow-sm" style={{ width: `${todaysOverview.percentages[key]}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 shadow-md transition-all font-medium">Generate Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
