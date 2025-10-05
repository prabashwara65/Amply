import { useEffect, useState } from "react";
import { getReservations, deleteReservation } from "../../Services/ReservationService/reservationSevice";
import { ToastContainer, toast } from "react-toastify";
import { QrCode, Edit2, Trash2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);

  const fetchReservations = async () => {
    try {
      const { data } = await getReservations();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      toast.error("Failed to load reservations.");
    }
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to cancel this reservation?</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={async () => {
                try {
                  await deleteReservation(id);
                  fetchReservations();
                  toast.success("Reservation cancelled successfully!");
                  toast.dismiss(t.id);
                } catch (err) {
                  toast.error("Failed to cancel reservation.");
                  toast.dismiss(t.id);
                }
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Reservations</h2>
        <p className="text-gray-600">View and manage all reservations</p>
      </div>

      {/* Reservation List */}
      <div className="flex flex-col gap-4">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap md:flex-nowrap items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all px-6 py-4"
          >
            {/* Left Section - QR Code */}
            <div className="flex items-center gap-4 min-w-[100px]">
              {r.qrCode ? (
                <img
                  src={r.qrCode}
                  alt="QR Code"
                  className="w-16 h-16 border border-gray-300 rounded-lg p-1 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedQr(r.qrCode)}
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center border border-dashed border-gray-300 text-gray-400 rounded-lg">
                  <QrCode className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Middle Section - Reservation Details */}
            <div className="flex-1 flex flex-wrap gap-6 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">{r.fullName}</p>
                <p>NIC: {r.nic}</p>
              </div>
              <div>
                <p>Reservation Code: <span className="font-medium">{r.reservationCode}</span></p>
                <p>Vehicle No: {r.vehicleNumber}</p>
              </div>
              <div>
                <p>Email: {r.email}</p>
                <p>Phone: {r.phone}</p>
              </div>
              <div>
                <p>Station: {r.chargingStationName}</p>
                <p>Slot: {r.slotName}</p>
              </div>
              <div>
                <p>Date: {r.date}</p>
                <p>Time: {r.time}</p>
              </div>
              <div>
                <p>Status: 
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium 
                    ${r.status === "Confirmed" ? "bg-green-100 text-green-700" : 
                      r.status === "Pending" ? "bg-yellow-100 text-yellow-700" : 
                      "bg-red-100 text-red-700"}`}>
                    {r.status || "Unknown"}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={() => (window.location.href = `/reservation/edit/${r.id}`)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Reservation QR</h4>
            <img src={selectedQr} alt="QR Code" className="w-48 h-48 mb-4" />
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => setSelectedQr(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
