// src/Pages/Reservation/ReservationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation, getReservationById, updateReservation } from "../../Servicess/ReservationService/reservationSevice";

export default function ReservationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: 1,
  });

  // If editing, load existing reservation
  useEffect(() => {
    if (id) {
      const fetchReservation = async () => {
        const { data } = await getReservationById(id);
        setForm({
          name: data.name,
          email: data.email,
          date: new Date(data.date).toISOString().slice(0, 16),
          guests: data.guests,
        });
      };
      fetchReservation();
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await updateReservation(id, form);
    } else {
      await createReservation(form);
    }
    navigate("/reservations");
  };

  return (
    <div className="container mt-4">
      <h2>{id ? "Edit Reservation" : "Add Reservation"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Date & Time</label>
          <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Guests</label>
          <input type="number" name="guests" value={form.guests} min="1" onChange={handleChange} className="form-control" required />
        </div>
        <button type="submit" className="btn btn-success">{id ? "Update" : "Create"}</button>
      </form>
    </div>
  );
}
