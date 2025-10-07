using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Amply.Server.Dtos
{
    public class OwnerProfileRequest
    {
        [Required, StringLength(12, MinimumLength = 10)]
        [JsonPropertyName("nic")]
        public string NIC { get; set; } = string.Empty;

        [Required, StringLength(100)]
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        [Required, StringLength(15)]
        [JsonPropertyName("phone")]
        public string Phone { get; set; } = string.Empty;

      
    }
}