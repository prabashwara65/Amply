// src/services/authService.js
import axios from "axios";

const API_URL = "https://localhost:7269/api/v1/authenticate"; 

export const register = async (data) => {
  return await axios.post(`${API_URL}/register`, data);
};

export const login = async (data) => {
  return await axios.post(`${API_URL}/login`, data);
};
