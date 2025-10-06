using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MongoDB.Driver;

namespace Amply.Server.Dtos
{
    public class ReservationRequest
    {
        [Required, StringLength(100)]
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(12, MinimumLength = 10)]
        [JsonPropertyName("nic")]
        public string? NIC { get; set; }

        [Required]
        [JsonPropertyName("vehicleNumber")]
        public string? VehicleNumber { get; set; }

        [Required]
        [JsonPropertyName("stationId")]
        public string StationId { get; set; } = string.Empty;

        [Required, StringLength(200)]
        [JsonPropertyName("stationName")]
        public string StationName { get; set; } = string.Empty;

        [Required, Range(1, 10)]
        [JsonPropertyName("slotNo")]
        public int SlotNo { get; set; }

        [Required]
        [JsonPropertyName("reservationDate")]
        public DateTime ReservationDate { get; set; }

        [Required]
        [JsonPropertyName("startTime")]
        public TimeSpan StartTime { get; set; }

        [Required]
        [JsonPropertyName("endTime")]
        public TimeSpan EndTime { get; set; }


   
    }
}
