// src/Pages/ChargingStationManagement/StationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChargingStationById } from '../../Services/ChargingStationManagementService/chargingStationService';
import { getReservationsByStationId, getReservationsByStationName, confirmReservation } from '../../Services/ReservationService/reservationSevice';
import { toast } from 'react-toastify';

export default function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchStationDetails();
  }, [id]);

  useEffect(() => {
    if (station) {
      fetchReservations();
    }
  }, [station]);

  const fetchStationDetails = async () => {
    try {
      const { data } = await getChargingStationById(id);
      setStation(data);
    } catch (error) {
      console.error('Error fetching station details:', error);
      toast.error('Failed to load station details');
    }
  };

  const fetchReservations = async () => {
    try {
      let data = [];
      
      // Use the station's stationId field (not MongoDB _id) to search for reservations
      if (station?.stationId) {
        try {
          const response = await getReservationsByStationId(station.stationId);
          data = response.data;
        } catch (stationIdError) {
          // If station ID fails, try by station name
          try {
            const response = await getReservationsByStationName(station.stationName);
            data = response.data;
          } catch (stationNameError) {
            data = [];
          }
        }
      }
      
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getReservationsForDate = (date) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate).toISOString().split('T')[0];
      return reservationDate === dateString;
    });
  };

  const getReservationForSlot = (date, slotNumber) => {
    if (!date) return null;
    
    const dateString = date.toISOString().split('T')[0];
    return reservations.find(reservation => {
      const reservationDate = new Date(reservation.reservationDate).toISOString().split('T')[0];
      return reservationDate === dateString && reservation.slotNo === slotNumber;
    });
  };


  const formatTime = (timeSpan) => {
    if (typeof timeSpan === 'string') {
      return timeSpan;
    }
    // Handle TimeSpan object from backend
    const hours = Math.floor(timeSpan / 36000000000);
    const minutes = Math.floor((timeSpan % 36000000000) / 600000000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleConfirmReservation = async (reservationId) => {
    try {
      await confirmReservation(reservationId);
      toast.success('Reservation confirmed successfully!');
      // Refresh reservations to show updated status
      fetchReservations();
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm reservation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading station details...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Station Not Found</h2>
          <p className="text-gray-600 mb-4">The charging station you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/bodashboard', { state: { activeNav: 'ev-stations' } })}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/bodashboard', { state: { activeNav: 'ev-stations' } })}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{station.stationName}</h1>
            <p className="text-gray-600 mt-1">
              {station.location?.city && station.location?.state 
                ? `${station.location.city}, ${station.location.state}`
                : station.location?.address
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              station.status === "Active" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {station.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              station.type === "DC" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {station.type}
            </span>
          </div>
        </div>

        {/* Station Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Station Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Station ID:</span> {station.stationId}</p>
              <p><span className="font-medium">Operator:</span> {station.operatorId}</p>
              <p><span className="font-medium">Type:</span> {station.type}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Address:</span> {station.location?.address}</p>
              {station.location?.latitude && station.location?.longitude && (
                <p><span className="font-medium">Coordinates:</span> {station.location.latitude.toFixed(4)}, {station.location.longitude.toFixed(4)}</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservations</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Reservations:</span> {reservations.length}</p>
              <p><span className="font-medium">Confirmed:</span> {reservations.filter(r => r.status.toLowerCase() === 'confirmed').length}</p>
              <p><span className="font-medium">Pending:</span> {reservations.filter(r => r.status.toLowerCase() === 'pending').length}</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Slot Legend */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Slots</h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[1, 2, 3, 4, 5].map((slotNumber) => (
                <div key={slotNumber} className="text-center">
                  <div className="font-medium text-gray-700">Slot {slotNumber}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, index) => {
              const isToday = day && day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[150px] p-2 border border-gray-200 ${
                    day ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {[1, 2, 3, 4, 5].map((slotNumber) => {
                          const reservation = getReservationForSlot(day, slotNumber);
                          
                          return (
                            <div
                              key={slotNumber}
                              className="h-4 text-xs border-b border-gray-100 last:border-b-0 flex items-center"
                            >
                              <div className="w-8 text-gray-500 text-[10px]">
                                {slotNumber}
                              </div>
                              <div className="flex-1 ml-1">
                                {reservation ? (
                                  <div
                                    className={`px-1 py-0.5 rounded text-[9px] truncate ${getStatusColor(reservation.status)} cursor-pointer`}
                                    title={`${reservation.fullName} - Slot ${slotNumber} - ${reservation.status}`}
                                  >
                                    {reservation.status.toLowerCase() === 'pending' && (
                                      <span className="mr-0.5">⏳</span>
                                    )}
                                    {reservation.status.toLowerCase() === 'confirmed' && (
                                      <span className="mr-0.5">✓</span>
                                    )}
                                    {reservation.fullName}
                                  </div>
                                ) : (
                                  <div className="h-3 w-full bg-gray-50 rounded opacity-50"></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reservations List */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reservations</h3>
          {reservations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reservations found for this station.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slot
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
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reservation.fullName}</div>
                          <div className="text-sm text-gray-500">{reservation.nic}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(reservation.reservationDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reservation.slotNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {reservation.status.toLowerCase() === 'pending' ? (
                          <button
                            onClick={() => handleConfirmReservation(reservation.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {reservation.status === 'Confirmed' ? '✓ Confirmed' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
