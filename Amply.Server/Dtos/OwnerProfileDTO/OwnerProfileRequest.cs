/***************************************************************
 * Project      : Amply EV Charging Management System
 * File Name    : OwnerProfileRequest.cs
 * Author       : Sithmi Himanshi
 * Created Date : 2025-10-10
 * Description  : This Data Transfer Object (DTO) defines the 
 *                structure of an incoming API request when 
 *                creating or updating an EV Owner profile.
 * 
 * Last Modified: 2025-10-10
 * Modified By  : Sithmi Himanshi
 * Version      : 1.0
 ***************************************************************/

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

        [Required]
        public string Status { get; set; } = "active";


    }
}