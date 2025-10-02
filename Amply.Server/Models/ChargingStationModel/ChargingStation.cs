using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Amply.Server.Models
{
    public class ChargingStation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("stationId")]
        [BsonRequired, StringLength(50)]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("stationName")]
        [BsonRequired, StringLength(200)]
        public string StationName { get; set; } = string.Empty;

        [BsonElement("location")]
        public Location Location { get; set; } = new Location();

        [BsonElement("type")]
        [BsonRequired]
        public string Type { get; set; } = "AC"; // AC or DC

        [BsonElement("totalSlots")]
        [BsonRequired, Range(1, 50)]
        public int TotalSlots { get; set; } = 1;

        [BsonElement("availableSlots")]
        [BsonRequired, Range(0, 50)]
        public int AvailableSlots { get; set; } = 1;

        [BsonElement("schedule")]
        public List<ScheduleSlot> Schedule { get; set; } = new List<ScheduleSlot>();

        [BsonElement("operatorId")]
        [BsonRequired]
        public string OperatorId { get; set; } = string.Empty;

        [BsonElement("status")]
        [BsonRequired]
        public string Status { get; set; } = "Active"; // Active, Inactive

        [BsonElement("activeBookings")]
        public int ActiveBookings { get; set; } = 0;

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class Location
    {
        [BsonElement("address")]
        [BsonRequired, StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [BsonElement("latitude")]
        [BsonRequired]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        [BsonRequired]
        public double Longitude { get; set; }

        [BsonElement("city")]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [BsonElement("state")]
        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [BsonElement("country")]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;
    }

    public class ScheduleSlot
    {
        [BsonElement("date")]
        [BsonRequired]
        public DateTime Date { get; set; }

        [BsonElement("startTime")]
        [BsonRequired]
        public string StartTime { get; set; } = string.Empty;

        [BsonElement("endTime")]
        [BsonRequired]
        public string EndTime { get; set; } = string.Empty;

        [BsonElement("isAvailable")]
        [BsonRequired]
        public bool IsAvailable { get; set; } = true;

        [BsonElement("slotNumber")]
        public int SlotNumber { get; set; } = 1;
    }
}
