using System;
using System.ComponentModel.DataAnnotations;

namespace Amply.Server.Dtos
{
    public class ReservationRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required, Range(1, 100)]
        public int Guests { get; set; }
    }
}
