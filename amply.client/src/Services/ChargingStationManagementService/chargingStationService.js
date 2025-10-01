// src/services/chargingStationService.js
import axios from "axios";

// Base API URL for charging stations
const API_URL = "https://localhost:7269/api/v1/charging-stations";

// Get all charging stations
export const getChargingStations = async () => {
  return await axios.get(API_URL);
};

// Get a single charging station by ID
export const getChargingStationById = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// Create a new charging station
export const createChargingStation = async (data) => {
  return await axios.post(API_URL, data);
};

// Update an existing charging station
export const updateChargingStation = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// Delete a charging station
export const deleteChargingStation = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

// Deactivate a charging station
export const deactivateChargingStation = async (id) => {
  return await axios.patch(`${API_URL}/${id}/deactivate`);
};

// Activate a charging station
export const activateChargingStation = async (id) => {
  return await axios.patch(`${API_URL}/${id}/activate`);
};

// Update station schedule/slots
export const updateStationSchedule = async (id, scheduleData) => {
  return await axios.put(`${API_URL}/${id}/schedule`, scheduleData);
};

// Get station availability
export const getStationAvailability = async (id) => {
  return await axios.get(`${API_URL}/${id}/availability`);
};
