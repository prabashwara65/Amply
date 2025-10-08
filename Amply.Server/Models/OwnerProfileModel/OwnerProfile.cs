using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Amply.Server.Models
{
    [BsonIgnoreExtraElements]
    public class OwnerProfile
    {
        [BsonId]
        [BsonElement("nic")]
        [Required, StringLength(12, MinimumLength = 10)]
        public string NIC { get; set; } = string.Empty;

        [BsonElement("fullName")]
        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [BsonElement("password")]
        [Required]
        public string Password { get; set; } = string.Empty;

        [BsonElement("phone")]
        [Required, StringLength(15)]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("status")]
        [Required]
        public string Status { get; set; } = "active";

        [BsonElement("role")]
        public string Role { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}