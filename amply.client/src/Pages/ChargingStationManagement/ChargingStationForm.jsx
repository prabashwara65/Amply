// src/Pages/ChargingStationManagement/ChargingStationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createChargingStation, getChargingStationById, updateChargingStation } from "../../Services/ChargingStationManagementService/chargingStationService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChargingStationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    stationId: "",
    stationName: "",
    location: {
      address: "",
      latitude: 0,
      longitude: 0,
      city: "",
      state: "",
      country: ""
    },
    type: "AC", // AC or DC
    totalSlots: 1,
    availableSlots: 1,
    schedule: [],
    operatorId: "",
    status: "Active"
  });

  // Load existing charging station if editing
  useEffect(() => {
    if (id) {
      const fetchChargingStation = async () => {
        try {
          const { data } = await getChargingStationById(id);
          setForm({
            stationId: data.stationId || "",
            stationName: data.stationName || "",
            location: {
              address: data.location?.address || "",
              latitude: data.location?.latitude || 0,
              longitude: data.location?.longitude || 0,
              city: data.location?.city || "",
              state: data.location?.state || "",
              country: data.location?.country || ""
            },
            type: data.type || "AC",
            totalSlots: data.totalSlots || 1,
            availableSlots: data.availableSlots || 1,
            schedule: data.schedule || [],
            operatorId: data.operatorId || "",
            status: data.status || "Active"
          });
        } catch (error) {
          console.error("Error fetching charging station:", error);
          toast.error("Failed to load charging station details");
        }
      };
      fetchChargingStation();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleLocationChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.stationId || !form.stationName || !form.location.address || !form.type || !form.operatorId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.availableSlots > form.totalSlots) {
      toast.error("Available slots cannot be greater than total slots");
      return;
    }

    if (form.location.latitude === 0 && form.location.longitude === 0) {
      toast.error("Please provide valid latitude and longitude coordinates");
      return;
    }

    const payload = {
      ...form,
      totalSlots: parseInt(form.totalSlots),
      availableSlots: parseInt(form.availableSlots)
    };
    
    try {
      if (id) {
        const res = await updateChargingStation(id, payload);
        toast.success(res.data.message || "Charging station updated successfully!");
      } else {
        const res = await createChargingStation(payload);
        toast.success(res.data.message || "Charging station created successfully!");
      }
      navigate("/charging-stations");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? "Edit Charging Station" : "Create New Charging Station"}
              </h1>
              <p className="text-gray-600 mt-1">
                {id ? "Update your charging station details" : "Add a new charging station to the network. Fast, reliable and efficient."}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/charging-stations"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Stations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Station Information</h3>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new charging station</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Station ID *</label>
                  <input
                    type="text"
                    name="stationId"
                    value={form.stationId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., STN-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Station Name *</label>
                  <input
                    type="text"
                    name="stationName"
                    value={form.stationName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Downtown Charging Hub"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Station Type *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="AC">AC (Alternating Current)</option>
                    <option value="DC">DC (Direct Current)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operator ID *</label>
                  <input
                    type="text"
                    name="operatorId"
                    value={form.operatorId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., OP-001"
                    required
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="location.address"
                    value={form.location.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 123 Main Street, City, State"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      name="location.latitude"
                      value={form.location.latitude}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 40.7128"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      name="location.longitude"
                      value={form.location.longitude}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., -74.0060"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="location.city"
                      value={form.location.city}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="location.state"
                      value={form.location.state}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="location.country"
                      value={form.location.country}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., USA"
                    />
                  </div>
                </div>
              </div>

              {/* Slot Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Slots *</label>
                  <input
                    type="number"
                    name="totalSlots"
                    value={form.totalSlots}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots *</label>
                  <input
                    type="number"
                    name="availableSlots"
                    value={form.availableSlots}
                    onChange={handleChange}
                    min="0"
                    max={form.totalSlots}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>


              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link
                  to="/charging-stations"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {id ? "Update Charging Station" : "Create Charging Station"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
        