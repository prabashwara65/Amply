// src/Pages/ChargingStationManagement/ChargingStationFormDialog.jsx
import { useState, useEffect } from "react";
import { createChargingStation, getChargingStationById, updateChargingStation } from "../../Services/ChargingStationManagementService/chargingStationService";
import { toast } from 'react-toastify';

export default function ChargingStationFormDialog({ isOpen, onClose, stationId, onSuccess }) {
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
    totalSlots: 35, // 7 days * 5 slots = 35 total slots
    availableSlots: 35, // Initially all slots are available
    schedule: [],
    operatorId: "",
    status: "Active"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate default schedule for new stations (7 days, 5 slots each)
  const generateDefaultSchedule = () => {
    const schedule = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      for (let slot = 1; slot <= 5; slot++) {
        schedule.push({
          date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
          startTime: `${8 + (slot - 1) * 2}:00`, // 8:00, 10:00, 12:00, 14:00, 16:00
          endTime: `${10 + (slot - 1) * 2}:00`, // 10:00, 12:00, 14:00, 16:00, 18:00
          isAvailable: true,
          slotNumber: slot
        });
      }
    }
    
    return schedule;
  };

  // Load existing charging station if editing
  useEffect(() => {
    if (stationId && isOpen) {
      const fetchChargingStation = async () => {
        try {
          setLoading(true);
          const { data } = await getChargingStationById(stationId);
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
        } finally {
          setLoading(false);
        }
      };

      fetchChargingStation();
    } else if (!stationId && isOpen) {
      // Reset form for new station with default schedule
      const defaultSchedule = generateDefaultSchedule();
      setForm({
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
        type: "AC",
        totalSlots: 35, // 7 days * 5 slots = 35 total slots
        availableSlots: 35, // Initially all slots are available
        schedule: defaultSchedule,
        operatorId: "",
        status: "Active"
      });
      setErrors({});
    }
  }, [stationId, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.stationId.trim()) newErrors.stationId = "Station ID is required";
    if (!form.stationName.trim()) newErrors.stationName = "Station name is required";
    if (!form.location.address.trim()) newErrors["location.address"] = "Address is required";
    if (!form.location.city.trim()) newErrors["location.city"] = "City is required";
    if (!form.location.state.trim()) newErrors["location.state"] = "State is required";
    if (!form.location.country.trim()) newErrors["location.country"] = "Country is required";
    if (form.location.latitude === 0 || isNaN(form.location.latitude)) newErrors["location.latitude"] = "Valid latitude is required";
    if (form.location.longitude === 0 || isNaN(form.location.longitude)) newErrors["location.longitude"] = "Valid longitude is required";
    if (!form.operatorId.trim()) newErrors.operatorId = "Operator ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      setLoading(true);
      
      if (stationId) {
        await updateChargingStation(stationId, form);
        toast.success("Charging station updated successfully!");
      } else {
        await createChargingStation(form);
        toast.success("Charging station created successfully!");
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving charging station:", error);
      toast.error(stationId ? "Failed to update charging station" : "Failed to create charging station");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {stationId ? "Edit Charging Station" : "Add New Charging Station"}
            </h2>
            <p className="text-gray-600 mt-1">
              {stationId ? "Update your charging station details" : "Add a new charging station to the network"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station ID *
              </label>
              <input
                type="text"
                name="stationId"
                value={form.stationId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                  errors.stationId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., STN001"
              />
              {errors.stationId && <p className="text-red-500 text-sm mt-1">{errors.stationId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station Name *
              </label>
              <input
                type="text"
                name="stationName"
                value={form.stationName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                  errors.stationName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Downtown Charging Hub"
              />
              {errors.stationName && <p className="text-red-500 text-sm mt-1">{errors.stationName}</p>}
            </div>
          </div>

          {/* Location Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={form.location.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors["location.address"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="123 Main Street"
                />
                {errors["location.address"] && <p className="text-red-500 text-sm mt-1">{errors["location.address"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={form.location.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors["location.city"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="New York"
                />
                {errors["location.city"] && <p className="text-red-500 text-sm mt-1">{errors["location.city"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={form.location.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors["location.state"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="NY"
                />
                {errors["location.state"] && <p className="text-red-500 text-sm mt-1">{errors["location.state"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={form.location.country}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors["location.country"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="USA"
                />
                {errors["location.country"] && <p className="text-red-500 text-sm mt-1">{errors["location.country"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.latitude"
                  value={form.location.latitude}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors["location.latitude"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="40.7128"
                />
                {errors["location.latitude"] && <p className="text-red-500 text-sm mt-1">{errors["location.latitude"]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.longitude"
                  value={form.location.longitude}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors["location.longitude"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="-74.0060"
                />
                {errors["location.longitude"] && <p className="text-red-500 text-sm mt-1">{errors["location.longitude"]}</p>}
              </div>
            </div>
          </div>

          {/* Station Configuration */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Configuration</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Automatic Schedule Generation:</strong> Each station will automatically have 35 slots (7 days × 5 slots per day) 
                with time slots from 8:00 AM to 6:00 PM. You can manage the schedule after creating the station.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="AC">AC (Alternating Current)</option>
                  <option value="DC">DC (Direct Current)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operator ID *
                </label>
                <input
                  type="text"
                  name="operatorId"
                  value={form.operatorId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                    errors.operatorId ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., OP001"
                />
                {errors.operatorId && <p className="text-red-500 text-sm mt-1">{errors.operatorId}</p>}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {stationId ? "Updating..." : "Creating..."}
                </div>
              ) : (
                stationId ? "Update Station" : "Create Station"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
