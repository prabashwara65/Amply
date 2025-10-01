// src/Pages/Reservation/ReservationList.jsx
import { useEffect, useState } from "react";
import { getReservations, deleteReservation } from "../../Services/ReservationService/reservationSevice";
import { Link } from "react-router-dom";
import DataTable from "../../Components/dataTable"; 

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    try {
      const { data } = await getReservations();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      alert("Failed to load reservations.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      try {
        await deleteReservation(id);
        fetchReservations();
      } catch (err) {
        console.error("Error deleting reservation:", err);
        alert("Failed to delete reservation.");
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Counts
  const pendingCount = reservations.filter(r => r.status.toLowerCase() === "pending").length;
  const confirmedCount = reservations.filter(r => r.status.toLowerCase() === "confirmed").length;
  const todayCount = reservations.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.reservationDate).toDateString() === today;
  }).length;

  // Columns for DataTable
  const columns = [
    { header: "Reservation Code", accessor: "reservationCode" },
    { header: "Full Name", accessor: "fullName" },
    { header: "NIC", accessor: "nic" },
    { header: "Station Name", accessor: "stationName" },
    { header: "Slot No", accessor: "slotNo" },
    { header: "Station ID", accessor: "stationId" },
    { header: "Booking Date", accessor: "bookingDate", cell: (row) => new Date(row.bookingDate).toLocaleDateString() },
    { header: "Reservation Date", accessor: "reservationDate", cell: (row) => new Date(row.reservationDate).toLocaleDateString() },
    { header: "Start Time", accessor: "startTime", cell: (row) => new Date(row.startTime).toLocaleString() },
    { header: "End Time", accessor: "endTime", cell: (row) => new Date(row.endTime).toLocaleString() },
    { header: "Status", accessor: "status" },
    {header: "UpdatedAt" , accessor: "updatedAt", cell: (row) => new Date(row.updatedAt).toLocaleDateString()  } 
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-700 to-gray-500">
      <div className="w-full max-w-7xl bg-white/20 backdrop-blur-md shadow-lg rounded-lg p-10 text-white mt-10 mb-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 font-mono">
          <h2 className="text-3xl font-bold ">Reservations</h2>
          <Link 
            to="/reservation/new" 
            className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition font-bold"
          >
            + Add Reservation
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-5 font-mono">
          <div className="bg-black/40 p-5 rounded-lg text-center shadow-md hover:bg-black/60 transition">
            <h3 className="text-lg font-semibold ">Pending Reservations</h3>
            <p className="text-3xl font-bold mt-2">{pendingCount}</p>
          </div>
          <div className="bg-black/40 p-5 rounded-lg text-center shadow-md hover:bg-black/60 transition">
            <h3 className="text-lg font-semibold">Confirmed Reservations</h3>
            <p className="text-3xl font-bold mt-2">{confirmedCount}</p>
          </div>
          <div className="bg-black/40 p-5 rounded-lg text-center shadow-md hover:bg-black/60 transition">
            <h3 className="text-lg font-semibold">Today's Reservations</h3>
            <p className="text-3xl font-bold mt-2">{todayCount}</p>
          </div>
        </div>


        {/* Data Table */}
        <div className="font-mono text-gray-200">
          <DataTable
            columns={columns}
            data={reservations}
            title="Reservations"
            onEdit={(row) => window.location.href = `/reservation/edit/${row.id}`}
            onDelete={(row) => handleDelete(row.id)}
          />
        </div>
      </div>
    </div>
  );
}
