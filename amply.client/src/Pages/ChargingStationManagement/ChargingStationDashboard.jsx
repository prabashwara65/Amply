// src/Pages/ChargingStationManagement/ChargingStationDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChargingStations, deleteChargingStation } from "../../Services/ChargingStationManagementService/chargingStationService";
import { getReservations } from "../../Services/ReservationService/reservationSevice";
import DeactivationModal from "./DeactivationModal";
import { toast } from 'react-toastify';

export default function ChargingStationDashboard() {
  const [chargingStations, setChargingStations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deactivationModal, setDeactivationModal] = useState({
    isOpen: false,
    station: null
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stationsResponse, bookingsResponse] = await Promise.all([
        getChargingStations(),
        getReservations()
      ]);
      
      setChargingStations(stationsResponse.data || []);
      setRecentBookings(bookingsResponse.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this charging station? This action cannot be undone.")) {
      try {
        await deleteChargingStation(id);
        toast.success("Charging station deleted successfully!");
        fetchDashboardData();
      } catch (err) {
        console.error("Error deleting charging station:", err);
        toast.error("Failed to delete charging station.");
      }
    }
  };

  const handleDeactivate = (station) => {
    setDeactivationModal({
      isOpen: true,
      station: station
    });
  };

  const handleDeactivationSuccess = () => {
    fetchDashboardData();
  };

  const closeDeactivationModal = () => {
    setDeactivationModal({
      isOpen: false,
      station: null
    });
  };

  const handleActivate = async (station) => {
    try {
      const { activateChargingStation } = await import("../../Services/ChargingStationManagementService/chargingStationService");
      await activateChargingStation(station.id);
      toast.success("Charging station activated successfully!");
      fetchDashboardData();
    } catch (err) {
      console.error("Error activating charging station:", err);
      toast.error("Failed to activate charging station.");
    }
  };

  // Filter stations based on search query
  const filteredStations = chargingStations.filter(station =>
    station.stationId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location?.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.operatorId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalStations = chargingStations.length;
  const activeStations = chargingStations.filter(station => station.status === "Active").length;
  const activeBookings = recentBookings.filter(booking => 
    booking.status?.toLowerCase() === "confirmed" || booking.status?.toLowerCase() === "active"
  ).length;
  const pendingBookings = recentBookings.filter(booking => 
    booking.status?.toLowerCase() === "pending"
  ).length;
  const totalSlots = chargingStations.reduce((sum, station) => sum + (station.totalSlots || 0), 0);
  const availableSlots = chargingStations.reduce((sum, station) => sum + (station.availableSlots || 0), 0);

  // Get recent bookings (last 5)
  const recentBookingsList = recentBookings
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
    .slice(0, 5);

  // Get station status (first 5 stations)
  const stationStatusList = chargingStations.slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'bg-blue-600 text-white';
      case 'pending':
        return 'bg-gray-400 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStationStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-500';
      case 'Maintenance':
        return 'text-yellow-500';
      case 'Inactive':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage charging stations and bookings.</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Add Station Button */}
              <Link
                to="/charging-stations/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Station
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Stations */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Stations</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{totalStations}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Bookings</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{activeBookings}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Today
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{pendingBookings}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Slots</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{availableSlots}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-purple-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          of {totalSlots}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charging Stations Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Charging Stations</h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredStations.length} of {chargingStations.length} stations
            </p>
          </div>
          
          {filteredStations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new charging station.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Link
                    to="/charging-stations/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Station
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Station ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Station Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStations.map((station) => (
                    <tr key={station.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{station.stationId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{station.stationName}</div>
                          <div className="text-sm text-gray-500">{station.location?.address}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {station.location?.city && station.location?.state 
                            ? `${station.location.city}, ${station.location.state}`
                            : station.location?.address
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {station.location?.latitude && station.location?.longitude 
                            ? `${station.location.latitude.toFixed(4)}, ${station.location.longitude.toFixed(4)}`
                            : "No coordinates"
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          station.type === "DC" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {station.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {station.availableSlots || 0}/{station.totalSlots || 0}
                        </div>
                        <div className="text-xs text-gray-500">Available/Total</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{station.operatorId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          station.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {station.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/charging-stations/edit/${station.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/charging-stations/schedule/${station.id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Schedule
                          </Link>
                          {station.status === "Active" ? (
                            <button
                              onClick={() => handleDeactivate(station)}
                              className="text-orange-600 hover:text-orange-900"
                              disabled={station.activeBookings > 0}
                              title={station.activeBookings > 0 ? "Cannot deactivate - has active bookings" : "Deactivate station"}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(station)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(station.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deactivation Modal */}
        <DeactivationModal
          isOpen={deactivationModal.isOpen}
          onClose={closeDeactivationModal}
          station={deactivationModal.station}
          onSuccess={handleDeactivationSuccess}
        />
      </div>
    </div>
  );
}
