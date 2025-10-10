import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createReservation,
  getReservationById,
  updateReservation,
} from "../../Services/ReservationService/reservationSevice";
import { getOwnerByNIC } from "../../Services/UserProfileService/userProfileService"
import { getActiveChargingStations } from "../../Services/ChargingStationManagementService/chargingStationService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Zap, CalendarDays, MapPin, User, IdCard, Clock, Plug, Car} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ReservationForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [stations, setStations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDaySlots, setSelectedDaySlots] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    nic: "",
    vehicleNumber : "",
    stationId: "",
    stationName: "",
    slotNo: 1,
    reservationDate: "",
    startTime: "",
    endTime: "",
  });

  const [weekSlots] = useState([
    { day: "MON", slots: 3, start: "08:00", end: "20:00" },
    { day: "TUE", slots: 2, start: "09:00", end: "19:00" },
    { day: "WED", slots: 4, start: "07:30", end: "18:30" },
    { day: "THU", slots: 1, start: "10:00", end: "17:00" },
    { day: "FRI", slots: 0, start: "-", end: "-" },
    { day: "SAT", slots: 5, start: "09:00", end: "21:00" },
    { day: "SUN", slots: 3, start: "08:00", end: "16:00" },
  ]);

    const handleNICChange = async (e) => {
        const nic = e.target.value;
        setForm({ ...form, nic });

        if (nic.length > 0) {
            try {
                const { data } = await getOwnerByNIC(nic);
                setForm((prev) => ({ ...prev, fullName: data.fullName }));
            } catch (err) {
                setForm((prev) => ({ ...prev, fullName: "" }));
                toast.error("No owner profile found with this NIC.");
            }
        } else {
            setForm((prev) => ({ ...prev, fullName: "" }));
        }
    };


  // Fetch reservation if editing
  useEffect(() => {
    if (id) {
      const fetchReservation = async () => {
        const { data } = await getReservationById(id);
        setForm({
          fullName: data.fullName,
          nic: data.nic || "",
          vehicleNumber: data.vehicleNumber || "",
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

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data } = await getActiveChargingStations();
        setStations(data);
      } catch {
        toast.error("Failed to fetch active stations");
      }
    };
    fetchStations();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "stationName") {
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

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const slotInfo = weekSlots.find((s) => s.day.startsWith(weekday));
    setSelectedDaySlots(slotInfo || null);
    if (slotInfo && slotInfo.slots > 0) {
      const formattedDate = date.toLocaleDateString("en-CA"); 
      setForm((prev) => ({
        ...prev,
        reservationDate: formattedDate,
        slotNo: 1,
        startTime: slotInfo.start !== "-" ? slotInfo.start : "",
        endTime: slotInfo.end !== "-" ? slotInfo.end : "",
      }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      slotNo: parseInt(form.slotNo),
      reservationDate: new Date(form.reservationDate).toISOString(),
      startTime: form.startTime + ":00",
      endTime: form.endTime + ":00",
    };

    try {
      if (id) {
        const res = await updateReservation(id, payload);
        toast.success(res.data.message || "Reservation updated!");
      } else {
        const res = await createReservation(payload);
        toast.success(res.data.message || "Reservation created!");
      }
      setTimeout(() => navigate("/bodashboard"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving reservation.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 py-10 px-6">
      <ToastContainer />

      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white">
          {id ? "Edit Reservation" : "New Reservation"}
        </h2>
        <p className="text-gray-400 mt-2">
          Easily manage your EV charging reservations below.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">
        {/* LEFT - FORM */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 text-gray-900">
          <h3 className="text-xl font-semibold mb-6 border-b pb-3 flex items-center gap-2">
            <Plug className="w-5 h-5 text-gray-700" /> Reservation Details
          </h3>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={<IdCard />} label="NIC" name="nic" value={form.nic} onChange={handleNICChange} required />
                      <InputField icon={<User />} label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required readOnly />
            <InputField icon={<Car/> }label= "Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} required/>
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Station Name"
              name="stationName"
              value={form.stationName}
              onChange={handleChange}
              options={stations.map((s) => ({ label: `${s.stationName} (${s.location.city})`, value: s.stationName }))}
            />
            <InputField icon={<MapPin />} label="Station ID" name="stationId" value={form.stationId} readOnly />
            <InputField icon={<CalendarDays />} type="date" label="Reservation Date" name="reservationDate" value={form.reservationDate} onChange={handleChange} required />
            <InputField label="Slot Number" name="slotNo" type="number" value={form.slotNo} onChange={handleChange} min={1} max={10} required />
            <InputField icon={<Clock />} label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} required />
            <InputField icon={<Clock />} label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleChange} required />
            </div>

            <div className="col-span-1 md:col-span-2 text-center mt-6">
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg shadow-md flex items-center justify-center gap-2 mx-auto transition"
              >
                <Zap className="w-5 h-5" />
                {id ? "Update Reservation" : "Confirm Reservation"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT - CALENDAR */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-lg p-6 text-gray-900">
          <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-gray-700" /> Select a Date
          </h3>
          <Calendar
            onClickDay={handleDateClick}
            value={selectedDate}
            className="rounded-lg shadow-sm border border-gray-200 p-2"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
          />

          {selectedDaySlots && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedDate.toDateString()}</h4>
              {selectedDaySlots.slots > 0 ? (
                <>
                  <p className="text-green-600 font-medium">
                    {selectedDaySlots.slots} slots available
                  </p>
                  <p className="text-sm text-gray-700">
                    Time: {selectedDaySlots.start} - {selectedDaySlots.end}
                  </p>
                </>
              ) : (
                <p className="text-red-500 font-medium">No slots available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🔹 Input Field with icon
function InputField({ label, name, value, onChange, type = "text", required, icon, readOnly, min, max }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-gray-400">
        {icon && <span className="text-gray-500 mr-2">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          min={min}
          max={max}
          className="flex-1 focus:outline-none text-gray-900 bg-transparent"
        />
      </div>
    </div>
  );
}

// 🔹 Select Field
function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-gray-400 shadow-sm focus:outline-none transition"
        required
      >
        <option value="">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
