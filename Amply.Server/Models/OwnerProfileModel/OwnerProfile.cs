/***************************************************************
 * Project      : Amply EV Charging Management System
 * File Name    : OwnerProfile.cs
 * Author       : Sithmi Himanshi
 * Created Date : 2025-10-10
 * Description  : MongoDB data model representing the EV Owner
 *                user profile used for authentication, 
 *                management, and API data persistence.
 * 
 * Last Modified: 2025-10-10
 * Modified By  : Sithmi Himanshi
 * Version      : 1.0
 ***************************************************************/

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

        //[BsonElement("role")]
        //public string Role { get; set; } = string.Empty;
        [BsonElement("role")]
        [Required]
        public string Role { get; set; } = "EvOwner"; 

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}