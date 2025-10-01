// src/Pages/ChargingStationManagement/DeactivationModal.jsx
import { useState } from "react";
import { deactivateChargingStation } from "../../Services/ChargingStationManagementService/chargingStationService";
import { toast } from 'react-toastify';

export default function DeactivationModal({ 
  isOpen, 
  onClose, 
  station, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const handleDeactivate = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for deactivation");
      return;
    }

    try {
      setLoading(true);
      await deactivateChargingStation(station.id, { reason: reason.trim() });
      toast.success("Charging station deactivated successfully!");
      onSuccess();
      onClose();
      setReason("");
    } catch (error) {
      console.error("Error deactivating station:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to deactivate charging station");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Deactivate Charging Station
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Warning
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This action will deactivate the charging station and make it unavailable for new bookings.</p>
                  {station?.activeBookings > 0 && (
                    <p className="mt-1 font-medium">
                      ⚠️ This station has {station.activeBookings} active booking(s). 
                      Consider waiting for them to complete before deactivating.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Station Details
            </h4>
            <div className="bg-gray-50 rounded-md p-3 text-sm">
              <p><span className="font-medium">Name:</span> {station?.name}</p>
              <p><span className="font-medium">Location:</span> {station?.location}</p>
              <p><span className="font-medium">Type:</span> {station?.type}</p>
              <p><span className="font-medium">Status:</span> {station?.status}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Deactivation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a reason for deactivating this station..."
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDeactivate}
            disabled={loading || !reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deactivating...
              </div>
            ) : (
              "Deactivate Station"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
