import { useEffect, useState } from "react";
import {
  getReservations,
  deleteReservation,
} from "../../Services/ReservationService/reservationSevice";
import { ToastContainer, toast } from "react-toastify";
import { QrCode, Edit2, Trash2, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQr, setSelectedQr] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      const { data } = await getReservations();
      setReservations(data);
      setFilteredReservations(data);
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
      { autoClose: false }
    );
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Search handler
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = reservations.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(query) ||
        r.nic?.includes(query) ||
        r.stationName?.toLowerCase().includes(query) ||
        r.reservationCode?.toLowerCase().includes(query)
    );
    setFilteredReservations(filtered);
    setCurrentPage(1);
  }, [searchQuery, reservations]);

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedData = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary counts
  const pendingCount = reservations.filter(
    (r) => r.status?.toLowerCase() === "pending"
  ).length;
  const confirmedCount = reservations.filter(
    (r) => r.status?.toLowerCase() === "confirmed"
  ).length;
  const todayCount = reservations.filter((r) => {
    const today = new Date().toDateString();
    return new Date(r.reservationDate).toDateString() === today;
  }).length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Reservations Dashboard
          </h2>
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
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {pendingCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg p-6 text-center">
          <p className="text-gray-500 font-medium">Confirmed Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {confirmedCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg p-6 text-center">
          <p className="text-gray-500 font-medium">Today's Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{todayCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by name, NIC, code, station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Reservation List */}
      <div className="flex flex-col gap-4">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No reservations found.
          </p>
        ) : (
          paginatedData.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap md:flex-nowrap items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all px-6 py-4"
            >
              {/* QR Section */}
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

              {/* Reservation Details */}
              <div className="flex-1 flex flex-wrap gap-6 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">{r.fullName}</p>
                  <p>NIC: {r.nic}</p>
                </div>
                <div>
                  <p>
                    Reservation Code:{" "}
                    <span className="font-medium">{r.reservationCode}</span>
                  </p>
                  <p>Vehicle No: {r.vehicleNumber}</p>
                </div>
                <div>
                  <p>Station: {r.stationName}</p>
                  <p>Slot: {r.slotNo}</p>
                </div>
                <div>
                  <p>
                    Date:{" "}
                    {r.reservationDate
                      ? new Date(r.reservationDate).toLocaleDateString("en-CA") // YYYY-MM-DD
                      : "N/A"}
                  </p>
                  <p>
                    Start Time: {r.startTime ? r.startTime.slice(0, 5) : "N/A"}
                  </p>
                  <p>End Time: {r.endTime ? r.endTime.slice(0, 5) : "N/A"}</p>
                </div>
                <div>
                  <p>
                    Status:
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : r.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <button
                  onClick={() =>
                    (window.location.href = `/reservation/edit/${r.id}`)
                  }
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
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Prev
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* QR Modal */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Reservation QR
            </h4>
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
