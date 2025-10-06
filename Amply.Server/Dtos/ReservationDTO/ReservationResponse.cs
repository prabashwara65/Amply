using System;

namespace Amply.Server.Dtos
{
    public class ReservationResponse
    {
        public string Id { get; set; } = string.Empty;

        public string ReservationCode { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string? NIC { get; set; }

        public string? VehicleNumber{ get; set; }

        public string StationId { get; set; } = string.Empty;

        public string StationName { get; set; } = string.Empty;

        public int SlotNo { get; set; }

        public DateTime BookingDate { get; set; }

        public DateTime ReservationDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string Status { get; set; } = "Pending";

        public string? QrCode { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
