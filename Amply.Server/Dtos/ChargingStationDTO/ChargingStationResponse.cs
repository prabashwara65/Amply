using System;
using System.Collections.Generic;

namespace Amply.Server.Dtos
{
    public class ChargingStationResponse
    {
        public string Id { get; set; } = string.Empty;

        public string StationId { get; set; } = string.Empty;

        public string StationName { get; set; } = string.Empty;

        public LocationResponse Location { get; set; } = new LocationResponse();

        public string Type { get; set; } = "AC";

        public int TotalSlots { get; set; } = 1;

        public int AvailableSlots { get; set; } = 1;

        public List<ScheduleSlotResponse> Schedule { get; set; } = new List<ScheduleSlotResponse>();

        public string OperatorId { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public int ActiveBookings { get; set; } = 0;

        public DateTime Timestamp { get; set; }
    }

    public class LocationResponse
    {
        public string Address { get; set; } = string.Empty;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;
    }

    public class ScheduleSlotResponse
    {
        public DateTime Date { get; set; }

        public TimeSpan StartTime { get; set; }   

        public TimeSpan EndTime { get; set; }     

        public bool IsAvailable { get; set; } = true;

        public int SlotNumber { get; set; } = 1;
    }
}
