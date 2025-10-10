/***************************************************************
 * Project      : Amply EV Charging Management System
 * File Name    : OwnerProfileResponse.cs
 * Author       : Sithmi Himanshi
 * Created Date : 2025-10-10
 * Description  : This Data Transfer Object (DTO) defines the 
 *                structure of the API response returned when 
 *                retrieving EV Owner profile data.
 * 
 * Last Modified: 2025-10-10
 * Modified By  : Sithmi Himanshi
 * Version      : 1.0
 ***************************************************************/


using System;

namespace Amply.Server.Dtos
{
    public class OwnerProfileResponse
    {
        public string NIC { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
    }
}