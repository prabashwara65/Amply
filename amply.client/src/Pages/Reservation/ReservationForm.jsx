// src/Pages/Reservation/ReservationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation, getReservationById, updateReservation } from "../../Services/ReservationService/reservationSevice";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          startTime: data.startTime ? data.startTime.slice(0, 5) : "",
          endTime: data.endTime ? data.endTime.slice(0, 5) : "",
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
      reservationDate: new Date(form.reservationDate).toISOString(),
      startTime: form.startTime + ":00",
      endTime:  form.endTime + ":00",
    };
    
    try{
    if (id) {
      const res = await updateReservation(id, payload);
      toast.success(res.data.message || "Reservation updated successfully!");
    } else {
      const res = await createReservation(payload);
      toast.success(res.data.message || "Reservation created successfully!");
    }
    navigate("/reservations");
  }  catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("An error occurred. Please try again.");
    }
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-700 to-gray-500">
      <div className="w-full max-w-5xl bg-white/20 backdrop-blur-md shadow-lg rounded-lg p-10 text-white">
        <h2 className="text-2xl font-bold  mb-4 text-center font-mono">
          {id
            ? "Edit Reservation"
            : "Create New Reservation"}
        </h2>
        <p className=" mb-10 text-gray-300 text-center font-medium font-mono">
          Book your charging station slot in just a few clicks. Fast, reliable and simple.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-10 font-mono">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm  font-bold">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="mt-1 w-full border text-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm  font-bold">NIC</label>
              <input
                type="text"
                name="nic"
                value={form.nic}
                onChange={handleChange}
                maxLength="12"
                className="mt-1 w-full text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm  font-bold">Station Name</label>
              <input
                type="text"
                name="stationName"
                value={form.stationName}
                onChange={handleChange}
                className="mt-1 w-full text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm  font-bold">Station ID</label>
              <input
                type="text"
                name="stationId"
                value={form.stationId}
                onChange={handleChange}
                className="mt-1 w-full  text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm  font-bold">Slot Number</label>
              <input
                type="number"
                name="slotNo"
                value={form.slotNo}
                min="1"
                max="10"
                onChange={handleChange}
                className="mt-1 w-full text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm  font-bold">Reservation Date</label>
              <input
                type="date"
                name="reservationDate"
                value={form.reservationDate}
                onChange={handleChange}
                className="mt-1 w-full text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm  font-bold">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="mt-1 w-full text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm  font-bold">End Time</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="mt-1 w-full text-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Button - full width across 2 columns */}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-1/2 bg-black text-white py-3 rounded-md hover:bg-gray-900 transition font-bold block mx-auto "
            >
              {id ? "Update Reservation" : "Confirm Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
