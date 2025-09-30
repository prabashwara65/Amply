// src/Pages/Reservation/ReservationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation, getReservationById, updateReservation } from "../../Services/ReservationService/reservationSevice";
import bannerImage from "../../Images/reservationBanner.jpg";

export default function ReservationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    fullName: "",
    nic: "",
    stationId: "",
    stationName: "",
    slotNo: 1,
    reservationDate: "",
    startTime: "",
    endTime: "",
  });

  // Load existing reservation if editing
  useEffect(() => {
    if (id) {
      const fetchReservation = async () => {
        const { data } = await getReservationById(id);
        setForm({
          fullName: data.fullName,
          nic: data.nic || "",
          stationId: data.stationId,
          stationName: data.stationName,
          slotNo: data.slotNo,
          reservationDate: new Date(data.reservationDate).toISOString().slice(0, 10),
          startTime: new Date(data.startTime).toISOString().slice(0, 16),
          endTime: new Date(data.endTime).toISOString().slice(0, 16),
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
    const payload = {
      ...form,
      slotNo: parseInt(form.slotNo),
      reservationDate: new Date(form.reservationDate),
      startTime: new Date(form.startTime),
      endTime: new Date(form.endTime),
    };

    if (id) {
      await updateReservation(id, payload);
    } else {
      await createReservation(payload);
    }
    navigate("/reservations");
  };

  return (
    <div>
      <div>
        
      <img src={bannerImage} alt="Reservation Banner" className="w h-64 object-cover mb-4" />
      </div>
    <div className="container mt-4">
      <h2>{id ? "Edit Reservation" : "Add Reservation"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">NIC</label>
          <input type="text" name="nic" value={form.nic} onChange={handleChange} className="form-control" maxLength="12" />
        </div>

        <div className="mb-3">
          <label className="form-label">Station ID</label>
          <input type="text" name="stationId" value={form.stationId} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Station Name</label>
          <input type="text" name="stationName" value={form.stationName} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Slot Number</label>
          <input type="number" name="slotNo" value={form.slotNo} min="1" max="10" onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Reservation Date</label>
          <input type="date" name="reservationDate" value={form.reservationDate} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Start Time</label>
          <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">End Time</label>
          <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} className="form-control" required />
        </div>

        <button type="submit" className="btn btn-success">{id ? "Update" : "Create"}</button>
      </form>
    </div>
    </div>
  );
}
