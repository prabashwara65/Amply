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
  ];

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold ml-5">Reservations</h2>
        <Link to="/reservation/new" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 mr-5">
          Add Reservation
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        title="Reservations"
        onEdit={(row) => window.location.href = `/reservation/edit/${row.id}`}
        onDelete={(row) => handleDelete(row.id)}
      />
    </div>
  );
}
