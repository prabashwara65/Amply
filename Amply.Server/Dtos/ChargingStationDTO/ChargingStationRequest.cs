using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Amply.Server.Dtos
{
    public class ChargingStationRequest
    {
        [Required, StringLength(50)]
        [JsonPropertyName("stationId")]
        public string StationId { get; set; } = string.Empty;

        [Required, StringLength(200)]
        [JsonPropertyName("stationName")]
        public string StationName { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("location")]
        public LocationRequest Location { get; set; } = new LocationRequest();

        [Required]
        [JsonPropertyName("type")]
        public string Type { get; set; } = "AC";

        [Required, Range(1, 50)]
        [JsonPropertyName("totalSlots")]
        public int TotalSlots { get; set; } = 1;

        [Required, Range(0, 50)]
        [JsonPropertyName("availableSlots")]
        public int AvailableSlots { get; set; } = 1;

        [JsonPropertyName("schedule")]
        public List<ScheduleSlotRequest> Schedule { get; set; } = new List<ScheduleSlotRequest>();

        [Required]
        [JsonPropertyName("operatorId")]
        public string OperatorId { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = "Active";
    }

    public class LocationRequest
    {
        [Required, StringLength(500)]
        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }

        [Required]
        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }

        [StringLength(100)]
        [JsonPropertyName("city")]
        public string? City { get; set; }

        [StringLength(100)]
        [JsonPropertyName("state")]
        public string? State { get; set; }

        [StringLength(100)]
        [JsonPropertyName("country")]
        public string? Country { get; set; }
    }

    public class ScheduleSlotRequest
    {
        [Required]
        [JsonPropertyName("date")]
        public DateTime Date { get; set; }

        [Required]
        [JsonPropertyName("startTime")]
        public TimeSpan StartTime { get; set; }   

        [Required]
        [JsonPropertyName("endTime")]
        public TimeSpan EndTime { get; set; }    

        [JsonPropertyName("isAvailable")]
        public bool IsAvailable { get; set; } = true;

        [JsonPropertyName("slotNumber")]
        public int SlotNumber { get; set; } = 1;
    }
}
