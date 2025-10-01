// src/Pages/ChargingStationManagement/ChargingStationList.jsx
import { useEffect, useState } from "react";
import { getChargingStations, deleteChargingStation } from "../../Services/ChargingStationManagementService/chargingStationService";
import { Link } from "react-router-dom";
import DataTable from "../../Components/dataTable";
import DeactivationModal from "./DeactivationModal";
import { toast } from 'react-toastify';

export default function ChargingStationList() {
  const [chargingStations, setChargingStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deactivationModal, setDeactivationModal] = useState({
    isOpen: false,
    station: null
  });

  const fetchChargingStations = async () => {
    try {
      setLoading(true);
      const { data } = await getChargingStations();
      setChargingStations(data);
    } catch (err) {
      console.error("Error fetching charging stations:", err);
      toast.error("Failed to load charging stations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this charging station? This action cannot be undone.")) {
      try {
        await deleteChargingStation(id);
        toast.success("Charging station deleted successfully!");
        fetchChargingStations();
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
    fetchChargingStations();
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
      fetchChargingStations();
    } catch (err) {
      console.error("Error activating charging station:", err);
      toast.error("Failed to activate charging station.");
    }
  };

  useEffect(() => {
    fetchChargingStations();
  }, []);

  // Calculate statistics
  const activeStations = chargingStations.filter(station => station.status === "Active").length;
  const inactiveStations = chargingStations.filter(station => station.status === "Inactive").length;
  const maintenanceStations = chargingStations.filter(station => station.status === "Maintenance").length;
  const totalSlots = chargingStations.reduce((sum, station) => sum + (station.totalSlots || 0), 0);
  const availableSlots = chargingStations.reduce((sum, station) => sum + (station.availableSlots || 0), 0);
  const acStations = chargingStations.filter(station => station.type === "AC").length;
  const dcStations = chargingStations.filter(station => station.type === "DC").length;

  // Columns for DataTable
  const columns = [
    { 
      header: "Station ID", 
      accessor: "stationId",
      cell: (row) => (
        <div className="font-semibold text-gray-900">{row.stationId}</div>
      )
    },
    { 
      header: "Station Name", 
      accessor: "stationName",
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.stationName}</div>
          <div className="text-sm text-gray-500">{row.location?.address}</div>
        </div>
      )
    },
    { 
      header: "Location", 
      accessor: "location",
      cell: (row) => (
        <div>
          <div className="text-sm text-gray-900">
            {row.location?.city && row.location?.state 
              ? `${row.location.city}, ${row.location.state}`
              : row.location?.address
            }
          </div>
          <div className="text-xs text-gray-500">
            {row.location?.latitude && row.location?.longitude 
              ? `${row.location.latitude.toFixed(4)}, ${row.location.longitude.toFixed(4)}`
              : "No coordinates"
            }
          </div>
        </div>
      )
    },
    { 
      header: "Type", 
      accessor: "type",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === "DC" 
            ? "bg-blue-100 text-blue-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {row.type}
        </span>
      )
    },
    { 
      header: "Slots", 
      accessor: "slots",
      cell: (row) => (
        <div className="text-center">
          <div className="font-semibold">{row.availableSlots || 0}/{row.totalSlots || 0}</div>
          <div className="text-xs text-gray-500">Available/Total</div>
        </div>
      )
    },
    { 
      header: "Operator", 
      accessor: "operatorId",
      cell: (row) => (
        <div className="text-sm text-gray-900">{row.operatorId}</div>
      )
    },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: "Updated", 
      accessor: "timestamp", 
      cell: (row) => new Date(row.timestamp).toLocaleDateString() 
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-700 to-gray-500">
        <div className="text-white text-xl">Loading charging stations...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Charging Stations</h1>
              <p className="text-gray-600 mt-1">Manage all charging stations in your network</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/charging-stations/new" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Charging Station
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Charging Stations</h3>
            <p className="text-sm text-gray-500 mt-1">
              {chargingStations.length} stations total
            </p>
          </div>
          <div className="p-6">

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 p-5 rounded-lg text-center border">
            <h3 className="text-lg font-semibold text-gray-700">Active Stations</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{activeStations}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg text-center border">
            <h3 className="text-lg font-semibold text-gray-700">Inactive Stations</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">{inactiveStations}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg text-center border">
            <h3 className="text-lg font-semibold text-gray-700">Maintenance</h3>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{maintenanceStations}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg text-center border">
            <h3 className="text-lg font-semibold text-gray-700">Total Slots</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600">{totalSlots}</p>
            <p className="text-sm text-gray-500">{availableSlots} available</p>
          </div>
        </div>

        {/* Station Type Summary */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-5 rounded-lg text-center border">
            <h3 className="text-lg font-semibold text-gray-700">AC Stations</h3>
            <p className="text-2xl font-bold mt-2 text-green-600">{acStations}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg text-center border">
            <h3 className="text-lg font-semibold text-gray-700">DC Stations</h3>
            <p className="text-2xl font-bold mt-2 text-blue-600">{dcStations}</p>
          </div>
        </div>

        {/* Data Table */}
        <div>
          <DataTable
            columns={columns}
            data={chargingStations}
            title="Charging Stations"
            onEdit={(row) => window.location.href = `/charging-stations/edit/${row.id}`}
            onDelete={(row) => handleDelete(row.id)}
            customActions={(row) => (
              <div className="flex gap-2">
                {row.status === "Active" ? (
                  <button
                    className="px-2 py-1 text-sm border rounded bg-orange-500 hover:bg-orange-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    onClick={() => handleDeactivate(row)}
                    disabled={row.activeBookings > 0}
                    title={row.activeBookings > 0 ? "Cannot deactivate - has active bookings" : "Deactivate station"}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="px-2 py-1 text-sm border rounded bg-green-500 hover:bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => handleActivate(row)}
                  >
                    Activate
                  </button>
                )}
                <Link
                  to={`/charging-stations/schedule/${row.id}`}
                  className="px-2 py-1 text-sm border rounded bg-purple-500 hover:bg-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Schedule
                </Link>
              </div>
            )}
          />
        </div>
          </div>
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
