// src/Components/DashboardNavbar.jsx
import React, { useState, useEffect } from "react"
import { Zap, LogOut } from "lucide-react"

export default function DashboardNavbar() {
  const [user, setUser] = useState({ name: "", role: "", email: "" })

  useEffect(() => {
    const email = localStorage.getItem("email") || "unknown@example.com"
    const role = localStorage.getItem("role") || "Unknown Role"
    const name = email.split("@")[0]
    setUser({ name, role, email })
  }, [])

  const initials = user.name
    .split(/[\s._-]+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-50 shadow">
      {/* Dashboard Title */}
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-gray-900" />
        <h2 className="text-lg font-bold text-gray-900">{user.role}</h2>
      </div>

      {/* Redesigned User Info + Logout */}
      <div className="flex items-center gap-3">
        {/* User Card */}
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
            {initials}
          </div>
          <div className="flex flex-col text-xs text-white leading-tight">
            <span className="font-semibold truncate max-w-[80px]">{user.name}</span>
            <span className="text-gray-400 truncate max-w-[80px]">{user.role}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-2 border border-red-600 rounded-md text-md bg-red-600 text-white transition"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>
    </header>
  )
}
