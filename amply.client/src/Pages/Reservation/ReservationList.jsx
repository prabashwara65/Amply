// src/Pages/Reservation/ReservationList.jsx
import { useEffect, useState } from "react";
import { getReservations, deleteReservation } from "../../Servicess/ReservationService/reservationSevice";
import { Link } from "react-router-dom";

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const { data } = await getReservations();
    setReservations(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      await deleteReservation(id);
      fetchReservations();
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Reservations</h2>
      <Link to="/reservation/new" className="btn btn-primary mb-2">Add Reservation</Link>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Guests</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{new Date(r.date).toLocaleString()}</td>
              <td>{r.guests}</td>
              <td>
                <Link to={`/reservation/edit/${r.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
