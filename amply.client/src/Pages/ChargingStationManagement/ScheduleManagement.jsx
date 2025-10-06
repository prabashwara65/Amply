// src/Pages/ChargingStationManagement/ScheduleManagement.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChargingStationById, updateStationSchedule, getStationAvailability } from "../../Services/ChargingStationManagementService/chargingStationService";
import { toast } from 'react-toastify';

export default function ScheduleManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotNumber: 1,
    isAvailable: true
  });

  useEffect(() => {
    fetchStationData();
  }, [id]);

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const [stationResponse, availabilityResponse] = await Promise.all([
        getChargingStationById(id),
        getStationAvailability(id)
      ]);
      
      setStation(stationResponse.data);
      setAvailability(availabilityResponse.data || []);
    } catch (error) {
      console.error("Error fetching station data:", error);
      toast.error("Failed to load station data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    if (!newSlot.slotNumber) {
      toast.error("Please select a slot number");
      return;
    }

    try {
      const slotData = {
        ...newSlot,
        date: selectedDate,
        slotNumber: parseInt(newSlot.slotNumber)
      };

      await updateStationSchedule(id, { action: "add", slot: slotData });
      toast.success("Slot added successfully!");
      setShowAddSlot(false);
      setNewSlot({
        slotNumber: 1,
        isAvailable: true
      });
      fetchStationData();
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("Failed to add slot");
    }
  };

  const handleRemoveSlot = async (slotId) => {
    if (window.confirm("Are you sure you want to remove this time slot?")) {
      try {
        await updateStationSchedule(id, { action: "remove", slotId });
        toast.success("Time slot removed successfully!");
        fetchStationData();
      } catch (error) {
        console.error("Error removing slot:", error);
        toast.error("Failed to remove time slot");
      }
    }
  };

  const handleToggleAvailability = async (slotId, isAvailable) => {
    try {
      await updateStationSchedule(id, { 
        action: "toggle", 
        slotId, 
        isAvailable: !isAvailable 
      });
      toast.success(`Slot ${!isAvailable ? 'enabled' : 'disabled'} successfully!`);
      fetchStationData();
    } catch (error) {
      console.error("Error toggling slot availability:", error);
      toast.error("Failed to update slot availability");
    }
  };

  const getSlotsForDate = (date) => {
    return availability.filter(slot => slot.date === date);
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-700 to-gray-500">
        <div className="text-white text-xl">Loading schedule data...</div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-700 to-gray-500">
        <div className="text-white text-xl">Station not found</div>
      </div>
    );
  }

  const todaySlots = getSlotsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
              <p className="text-gray-600 mt-1">{station.name} - {station.location}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/bodashboard", { state: { activeNav: "ev-stations" } })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Station Schedule & Slot Management</h3>
            <p className="text-sm text-gray-500 mt-1">Manage time slots and availability for this charging station</p>
          </div>
          <div className="p-6">

        {/* Station Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Station Type</h3>
            <p className="text-xl font-semibold text-gray-900">{station.type}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Total Slots</h3>
            <p className="text-xl font-semibold text-gray-900">{station.totalSlots}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Available Slots</h3>
            <p className="text-xl font-semibold text-green-600">{station.availableSlots}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`text-xl font-semibold ${
              station.status === 'Active' ? 'text-green-600' : 
              station.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {station.status}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Add Slot Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showAddSlot ? "Cancel" : "Add Time Slot"}
          </button>
        </div>

        {/* Add Slot Form */}
        {showAddSlot && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Time Slot</h3>
            <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slot Number</label>
                <input
                  type="number"
                  min="1"
                  max={station.totalSlots}
                  value={newSlot.slotNumber}
                  onChange={(e) => setNewSlot({...newSlot, slotNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Available Slots List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Available Slots for {new Date(selectedDate).toLocaleDateString()}
          </h3>
          
          {todaySlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-900">No time slots scheduled</p>
              <p className="text-sm text-gray-500">Click "Add Time Slot" to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySlots.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className={`p-4 rounded-lg border ${
                    slot.isAvailable 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          Slot #{slot.slotNumber}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        slot.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleAvailability(slot.id, slot.isAvailable)}
                        className={`px-3 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          slot.isAvailable
                            ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                            : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                        }`}
                      >
                        {slot.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleRemoveSlot(slot.id)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
