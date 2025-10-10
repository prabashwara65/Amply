// src/Pages/UserProfile/UserProfileList.jsx
import React, { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff } from "lucide-react"
import {
  getUserProfiles,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfileById,
} from "../../Services/UserProfileService/userProfileService"
import { deactivateUserProfile, requestReactivateUserProfile, activateUserProfile } from "../../Services/UserProfileService/userProfileService"

export default function EVOwnersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    nic: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  })
  const [owners, setOwners] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editNIC, setEditNIC] = useState("")
  const [message, setMessage] = useState("");

  // Fetch all EV owner profiles on component mount
  useEffect(() => {
    fetchOwners()
  }, [])

  // Fetch all EV owners from backend API
  const fetchOwners = async () => {
    try {
      const res = await getUserProfiles()
      setOwners(res.data)
    } catch (err) {
      console.error("Failed to fetch owners", err)
    }
  }

  // Filter owners based on search term
  const filteredOwners = owners.filter(
    (owner) =>
      owner.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.nic?.includes(searchTerm) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get badge styles based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-gray-900 text-white"
      case "inactive":
        return "bg-gray-300 text-gray-700 border border-gray-400"
      case "requested_reactivate":
        return "bg-gray-600 text-white"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  // Get display text based on status
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "inactive":
        return "Inactive"
      case "requested_reactivate":
        return "Requested to Reactivate"
      default:
        return status
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handles field validation when input loses focus
  const handleBlur = (e) => {
    const { name, value } = e.target
    let error = ""
    switch (name) {
      case "nic":
        error = validateNIC(value)
        break
      case "email":
        error = validateEmail(value)
        break
      case "phone":
        error = validatePhone(value)
        break
      case "password":
        error = validatePassword(value)
        break
      default:
        break
    }
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  // Handles form submission for create or update profile
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {
      nic: validateNIC(formData.nic),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
    }
    const hasErrors = Object.values(newErrors).some((error) => error !== "")
    if (hasErrors) {
      setErrors(newErrors)
      return
    }
    try {
      if (isEdit) {
        await updateUserProfile(editNIC, formData)
        setMessage("Profile updated successfully.");
      } else {
        await createUserProfile(formData)
        setMessage("Profile created successfully.");
      }
      setTimeout(() => {
      setShowModal(false);
      setFormData({
        nic: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
      });
      setErrors({});
      setIsEdit(false);
      setEditNIC("");
      fetchOwners();
    }, 1000);
    } catch (err) {
      alert("Error saving profile: " + (err.response?.data?.message || err.message))
    }
  }

  // Validates NIC format
  const validateNIC = (nic) => {
    const twelveDigits = /^\d{12}$/
    const elevenDigitsOneChar = /^\d{11}[a-zA-Z]$/
    if (twelveDigits.test(nic) || elevenDigitsOneChar.test(nic)) {
      return ""
    }
    return "NIC must be 12 digits or 11 digits followed by 1 character"
  }

  // Validates email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email)) {
      return ""
    }
    return "Please enter a valid email address"
  }

  // Validates phone number format
  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "")
    if (digits.length === 10) {
      return ""
    }
    return "Phone number must be exactly 10 digits"
  }

  // Validates password complexity
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least 1 lowercase letter"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 uppercase letter"
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least 1 digit"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least 1 special character"
    }
    return ""
  }

  // Handles deleting a user profile
  const handleDelete = async (nic) => {
    if (window.confirm("Are you sure you want to delete this EV owner profile?")) {
      try {
        await deleteUserProfile(nic)
        fetchOwners()
      } catch (err) {
        alert("Error deleting profile: " + (err.response?.data?.message || err.message))
      }
    }
  }

  // Handles editing a user profile
  const handleEdit = async (nic) => {
    try {
      const res = await getUserProfileById(nic)
      setFormData({
        nic: res.data.nic,
        fullName: res.data.fullName,
        email: res.data.email,
        phone: res.data.phone,
        password: "", // Don't show password, require re-entry
        status: res.data.status || "active",
      })
      setIsEdit(true)
      setEditNIC(nic)
      setShowModal(true)
    } catch (err) {
      alert("Error loading profile: " + (err.response?.data?.message || err.message))
    }
  }

  // Handles deactivating a user profile
  const handleDeactivate = async (nic) => {
  try {
    await deactivateUserProfile(nic);
    setMessage("Account has been deactivated.");
    fetchOwners(); 
    setTimeout(() => {
      setShowModal(false);
      setMessage(""); 
    }, 1000);
  } catch (err) {
    alert("Error deactivating profile: " + (err.response?.data?.message || err.message));
  }
};

// Handles requesting reactivation of a user profile
const handleRequestReactivate = async (nic) => {
  try {
    await requestReactivateUserProfile(nic);
    setMessage("Reactivation request sent.");
    fetchOwners();
    setTimeout(() => {
      setShowModal(false);
      setMessage(""); 
    }, 1000);  
  } catch (err) {
    alert("Error requesting reactivation: " + (err.response?.data?.message || err.message));
  }
};

// Handles activating a user profile
const handleActivate = async (nic) => {
  try {
    await activateUserProfile(nic);
    setMessage("Account has been activated.");
    fetchOwners();
    setTimeout(() => {
      setShowModal(false);
      setMessage(""); 
    }, 1000);     
  } catch (err) {
    alert("Error activating profile: " + (err.response?.data?.message || err.message));
  }
};

useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }
}, [message]);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">EV Owner Management</h2>
          <p className="text-gray-600">Manage EV owner profiles and accounts</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true)
            setIsEdit(false)
            setFormData({
              nic: "",
              fullName: "",
              email: "",
              phone: "",
              password: "",
              status: "active",
            })
            setErrors({})
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Profile
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, NIC, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">NIC</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Full Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Password</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOwners.map((owner) => (
                <tr key={owner.nic} className={`hover:bg-gray-50 transition-colors ${
        owner.status === "deactive" ? "bg-gray-100 text-gray-400" : ""
      }`}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{owner.nic}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{owner.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{owner.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{owner.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">********</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(owner.status)}`}>
                      {getStatusText(owner.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(owner.nic)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(owner.nic)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOwners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No EV owners found matching your search.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEdit ? "Edit EV Owner Profile" : "Create New EV Owner Profile"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setErrors({})
                  setIsEdit(false)
                  setEditNIC("")
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    placeholder="199512345678 or 199512345V"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      errors.nic ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isEdit}
                  />
                  {errors.nic && <p className="mt-1 text-sm text-red-500">{errors.nic}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    placeholder="john.doe@email.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    placeholder="0771234567"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Password <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <input
      type={isEdit ? "password" : (showPassword ? "text" : "password")}
      name="password"
      value={isEdit ? "********" : formData.password}
      onChange={isEdit ? undefined : handleInputChange}
      readOnly={isEdit}
      disabled={isEdit}
      placeholder={isEdit ? "" : "Enter password"}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-10 ${
        errors.password ? "border-red-500" : "border-gray-300"
      } ${isEdit ? "bg-gray-100" : ""}`}
    />
    {!isEdit && (
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    )}
  </div>
  {!isEdit && errors.password && (
    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
  )}
</div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setErrors({})
                    setIsEdit(false)
                    setEditNIC("")
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 shadow-md transition-all"
                >
                  {isEdit ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
            {message && (
  <div className="mt-4 mb-2 px-4 py-2 w-100 ml-34 rounded bg-green-100 text-green-800 border border-green-300 text-center">
    {message}
  </div>
)}
            {isEdit && (
        <div className="flex justify-end gap-3 px-6 pb-6">
          {formData.status === "active" && (
            <button
              onClick={() => handleDeactivate(formData.nic)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Deactivate
            </button>
          )}
          {formData.status === "deactive" && (
            <button
              onClick={() => handleRequestReactivate(formData.nic)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Request to Reactivate
            </button>
          )}
          {formData.status === "requested to reactivate" && (
            <button
              onClick={() => handleActivate(formData.nic)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Activate
            </button>
          )}
        </div>
      )}
          </div>
        </div>
      )}
    </>
  )
}