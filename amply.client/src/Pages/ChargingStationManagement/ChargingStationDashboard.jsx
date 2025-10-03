// src/Pages/ChargingStationManagement/ChargingStationDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getChargingStations, deleteChargingStation } from "../../Services/ChargingStationManagementService/chargingStationService";
import { getReservations } from "../../Services/ReservationService/reservationSevice";
import DeactivationModal from "./DeactivationModal";
import ChargingStationFormDialog from "./ChargingStationFormDialog";
import { toast } from 'react-toastify';

export default function ChargingStationDashboard() {
  const navigate = useNavigate();
  const [chargingStations, setChargingStations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deactivationModal, setDeactivationModal] = useState({
    isOpen: false,
    station: null
  });
  const [formDialog, setFormDialog] = useState({
    isOpen: false,
    stationId: null
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

  const openFormDialog = (stationId = null) => {
    setFormDialog({ isOpen: true, stationId });
  };

  const closeFormDialog = () => {
    setFormDialog({ isOpen: false, stationId: null });
  };

  const handleFormSuccess = () => {
    fetchDashboardData();
    closeFormDialog();
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
    <div className="p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">EV Stations Dashboard</h2>
          <p className="text-gray-600">Manage charging stations and bookings efficiently</p>
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
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          {/* Add Station Button */}
          <button
            onClick={() => openFormDialog()}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Station
          </button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Stations */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalStations}</p>
          <p className="text-sm text-gray-600">Total Stations</p>
        </div>

        {/* Active Bookings */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Today</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{activeBookings}</p>
          <p className="text-sm text-gray-600">Active Bookings</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{pendingBookings}</p>
          <p className="text-sm text-gray-600">Pending Approvals</p>
        </div>

        </div>

      {/* Charging Stations Cards */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Charging Stations</h3>
          <p className="text-sm text-gray-500">{filteredStations.length} of {chargingStations.length} stations</p>
        </div>
          
        {filteredStations.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new charging station.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <button
                  onClick={() => openFormDialog()}
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold inline-flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Station
                </button>
              </div>
            )}
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStations.map((station) => (
                <div 
                  key={station.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                  onClick={() => navigate(`/charging-stations/details/${station.id}`)}
                >
                  {/* Station Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{station.stationName}</h4>
                      <p className="text-sm text-gray-600 font-medium">{station.stationId}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      station.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {station.status}
                    </span>
                  </div>

                  {/* Location Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{station.location?.city && station.location?.state 
                        ? `${station.location.city}, ${station.location.state}`
                        : station.location?.address
                      }</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">{station.location?.address}</p>
                    {station.location?.latitude && station.location?.longitude && (
                      <p className="text-xs text-gray-400 ml-6">
                        {station.location.latitude.toFixed(4)}, {station.location.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Station Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        station.type === "DC" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {station.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Operator</p>
                      <p className="text-sm font-medium text-gray-900">{station.operatorId}</p>
                    </div>
                  </div>


                  {/* Actions */}
                  <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openFormDialog(station.id)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      to={`/charging-stations/schedule/${station.id}`}
                      className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors text-center"
                    >
                      Schedule
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    {station.status === "Active" ? (
                      <button
                        onClick={() => handleDeactivate(station)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={station.activeBookings > 0}
                        title={station.activeBookings > 0 ? "Cannot deactivate - has active bookings" : "Deactivate station"}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(station)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(station.id)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Form Dialog */}
      <ChargingStationFormDialog
        isOpen={formDialog.isOpen}
        onClose={closeFormDialog}
        stationId={formDialog.stationId}
        onSuccess={handleFormSuccess}
      />

      {/* Deactivation Modal */}
      <DeactivationModal
        isOpen={deactivationModal.isOpen}
        onClose={closeDeactivationModal}
        station={deactivationModal.station}
        onSuccess={handleDeactivationSuccess}
      />
    </div>
  );
}
