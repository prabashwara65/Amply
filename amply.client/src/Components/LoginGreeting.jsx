import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export default function LoginGreeting({ operatorName = "Operator" }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sri Lanka timezone string
  const sriLankaTime = currentTime.toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Greeting based on hour
  const hour = currentTime.toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
    hour: "numeric",
    hour12: false,
  });

  let greeting = "Hello";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 21) greeting = "Good Evening";
  else greeting = "Good Night";

  return (
    <div className="max-w-3xl mx-auto mt-12">
      <div className="bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 flex items-center gap-4">
        <div className="w-10 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">{greeting}</h1>
          <p className="text-sm text-gray-500">{sriLankaTime}</p>
        </div>
      </div>
    </div>
  );
}
