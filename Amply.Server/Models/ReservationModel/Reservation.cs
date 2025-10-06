using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Amply.Server.Models
{
    public class Reservation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public  string ? Id { get; set; }

        [BsonElement("reservationCode")]
        [BsonRequired]
        public string ReservationCode { get; set; } = string.Empty;

        [BsonElement("fullname")]
        [BsonRequired, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("nic")]
        [StringLength(12, MinimumLength = 10)]
        public string NIC { get; set; } = string.Empty;

        [BsonElement("vehicleNumber")]
        [Required]
        public string VehicleNumber { get; set; } = string.Empty;


        [BsonElement("stationId")]
        [Required]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("stationName")]
        [Required, StringLength(200)]
        public string StationName { get; set; } = string.Empty;

        [BsonElement("slotNo")]
        [Required]
        public int SlotNo { get; set; }

        [BsonElement("bookingDate")]
        [Required]
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        [BsonElement("reservationDate")]
        [Required]
        public DateTime ReservationDate { get; set; }

         [BsonElement("startTime")]
        [Required]
        public TimeSpan StartTime { get; set; }

        [BsonElement("endTime")]
        [Required]
        public TimeSpan EndTime { get; set; }

        [BsonElement("status")]
        [Required]
        public string Status { get; set; } = "Pending";

        [BsonElement("qrCode")]
        public string? QrCode { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
