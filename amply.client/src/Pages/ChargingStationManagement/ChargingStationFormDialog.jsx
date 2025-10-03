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
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
          isAvailable: true,
          slotNumber: slot
        });
      }
    }
    
    return schedule;
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          setForm(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: latitude,
              longitude: longitude,
              address: data.localityInfo?.administrative?.[0]?.name || 
                      data.localityInfo?.informative?.[0]?.name || 
                      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: data.city || data.locality || '',
              state: data.principalSubdivision || '',
              country: data.countryName || ''
            }
          }));
          
          toast.success("Location detected successfully!");
        } catch (error) {
          // Fallback: just use coordinates
          setForm(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: latitude,
              longitude: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }
          }));
          toast.success("Coordinates detected! Please enter the address manually.");
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location. Please enter coordinates manually.");
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
    
    setLocationLoading(false);
  };

  // Search for address suggestions
  const searchAddress = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(query)}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.results) {
        setAddressSuggestions(data.results.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Address search error:", error);
      setAddressSuggestions([]);
    }
  };

  // Select address from suggestions
  const selectAddress = (suggestion) => {
    setForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: suggestion.formatted || suggestion.locality || '',
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        city: suggestion.city || suggestion.locality || '',
        state: suggestion.principalSubdivision || '',
        country: suggestion.countryName || ''
      }
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
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
      
      // Trigger address search for address field
      if (locationField === 'address') {
        searchAddress(value);
      }
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
             {/* Coordinates Section with Help Text */}
             <div className="md:col-span-2">
                <div className="mb-4 p-3 bg-gray-300 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Easy Location Setup:</strong> Use the location icon next to the address field to auto-detect your current location, 
                    or start typing an address to see suggestions. Coordinates will be filled automatically!
                  </p>
                </div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location.address"
                    value={form.location.address}
                    onChange={handleChange}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                      errors["location.address"] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123 Main Street"
                  />
                  
                  {/* Location Detection Button */}
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    title="Detect current location"
                  >
                    {locationLoading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectAddress(suggestion)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900">
                            {suggestion.formatted || suggestion.locality}
                          </div>
                          <div className="text-sm text-gray-500">
                            {suggestion.city}, {suggestion.principalSubdivision}, {suggestion.countryName}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
