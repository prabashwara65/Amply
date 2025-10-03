// src/Pages/Reservation/ReservationList.jsx
import { useEffect, useState } from "react";
import { getReservations, deleteReservation, getStatusById } from "../../Services/ReservationService/reservationSevice";
import { Link } from "react-router-dom";
import UiTable from "../../Components/Table";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronRight, Trash2, Edit2, QrCode } from "lucide-react";

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);

  // Fetch all reservations
  const fetchReservations = async () => {
    try {
      const { data } = await getReservations();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      toast.error("Failed to load reservations.");
    }
  };

  // Delete reservation with confirmation toast
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
                  console.error("Error deleting reservation:", err);
                  toast.error("Failed to cancel reservation.");
                  toast.dismiss(t.id);
                }
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-gray-400 text-black rounded hover:bg-gray-500"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  // Show QR code for confirmed reservations
  const handleShowQr = async (id) => {
    try {
      console.log("Fetching QR for id:", id);
      const { data } = await getStatusById(id);
      if (data.isConfirmed && data.qrCode) {
        setSelectedQr(data.qrCode); 
      } else {
        toast.info("Reservation is not confirmed yet.");
      }
    } catch (err) {
      console.error("Error fetching QR:", err);
      toast.error("Failed to fetch QR code.");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Counts for summary cards
  const pendingCount = reservations.filter(r => r.status.toLowerCase() === "pending").length;
  const confirmedCount = reservations.filter(r => r.status.toLowerCase() === "confirmed").length;
  const todayCount = reservations.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.reservationDate).toDateString() === today;
  }).length;

  // Table columns
  const columns = [
    { header: "Reservation Code", accessor: "reservationCode" },
    { header: "Full Name", accessor: "fullName" },
    { header: "NIC", accessor: "nic" },
    { header: "Station Name", accessor: "stationName" },
    { header: "Slot No", accessor: "slotNo" },
    { header: "Booking Date", accessor: "bookingDate", cell: (row) => new Date(row.bookingDate).toLocaleDateString() },
    { header: "Reservation Date", accessor: "reservationDate", cell: (row) => new Date(row.reservationDate).toLocaleDateString() },
    { header: "Start Time", accessor: "startTime", cell: (row) => row.startTime?.slice(0, 5) },
    { header: "End Time", accessor: "endTime", cell: (row) => row.endTime?.slice(0, 5) },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      accessor: "id",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleShowQr(row.id)} className="text-blue-600 hover:text-blue-800">
            <QrCode className="w-5 h-5" />
          </button>
          <button onClick={() => window.location.href = `/reservation/edit/${row.id}`} className="text-yellow-600 hover:text-yellow-800">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Reservations Dashboard</h2>
          <p className="text-gray-600">Manage all reservations efficiently</p>
        </div>
        <Link
          to="/reservation/new"
          className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold flex items-center gap-2"
        >
          + Add Reservation <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg p-6 text-center">
          <p className="text-gray-500 font-medium">Pending Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg p-6 text-center">
          <p className="text-gray-500 font-medium">Confirmed Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{confirmedCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg p-6 text-center">
          <p className="text-gray-500 font-medium">Today's Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{todayCount}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">All Reservations</h3>
          <p className="text-sm text-gray-500">{reservations.length} total</p>
        </div>

        <UiTable
          title=""
          columns={columns}
          data={reservations}
        />
      </div>

      {/* QR Code Modal */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-4">
            <img src={selectedQr} alt="QR Code" className="w-64 h-64" />
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
