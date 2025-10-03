// src/Pages/Reservation/ReservationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation, getReservationById, updateReservation } from "../../Services/ReservationService/reservationSevice";
import { getActiveChargingStations } from '../../Services/ChargingStationManagementService/chargingStationService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Zap } from "lucide-react";

export default function ReservationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [stations, setStations] = useState([]);
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

  //const handleChange = (e) => {
  //  setForm({ ...form, [e.target.name]: e.target.value });
    //};

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "stationName") {
            //when station name changed , auto fill stationId
            const selectedStation = stations.find((s) => s.stationName === value);
            setForm({
                ...form,
                stationName: value,
                stationId: selectedStation ? selectedStation.stationId : "",
            });
        } else {
            setForm({ ...form, [name]: value });
        }
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
    
    try {
      if (id) {
        const res = await updateReservation(id, payload);
        toast.success(res.data.message || "Reservation updated successfully!");
      } else {
        const res = await createReservation(payload);
        toast.success(res.data.message || "Reservation created successfully!");
      }
      navigate("/reservations");
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
    };

    //Fetch active stations
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const { data } = await getActiveChargingStations();
                setStations(data);
            } catch (err) {
                console.log(err);
                toast.error("Failed to fetch stations");
            }
        };
        fetchStations();
    }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{id ? "Edit Reservation" : "New Reservation"}</h2>
        <p className="text-gray-600">Book your EV charging slot quickly and easily.</p>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-4">
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
            <FormField label="NIC" name="nic" value={form.nic} onChange={handleChange} maxLength={12} />
            {/*<FormField label="Station Name" name="stationName" value={form.stationName} onChange={handleChange} required />*/}

            {/*station dropdown */}
             <div>
                    <label className="block text-sm fornt-medium text-gray-700">
                        Station Name
                          </label>
                          <select
                              name="stationName"
                              value={form.stationName}
                              onChange={handleChange}
                              required
                              className="mt-1 w-full border border-gray-300 rounded md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:outline-none transition">
                              <option value="">Select a station</option>
                              {stations.map((station) => (
                                  <option key={station.id} value={station.stationName}>
                                      {station.stationName} ({station.location.city})
                                  </option>
                              ))}
                          </select>
            </div>

            <FormField label="Station ID" name="stationId" value={form.stationId} onChange={handleChange} required readOnly />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FormField label="Reservation Date" name="reservationDate" type="date" value={form.reservationDate} onChange={handleChange} required />
            <FormField label="Slot Number" name="slotNo" type="number" value={form.slotNo} onChange={handleChange} min={1} max={10} required />
            <FormField label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} required />
            <FormField label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleChange} required />
          </div>

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 mt-6 text-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition font-semibold shadow-md"
            >
              <Zap className="w-5 h-5" />
              {id ? "Update Reservation" : "Confirm Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Form Field Component
function FormField({ label, name, value, onChange, type = "text", required, maxLength, min, max, readOnly }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        readOnly={readOnly}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:outline-none transition"
      />
    </div>
  );
}
