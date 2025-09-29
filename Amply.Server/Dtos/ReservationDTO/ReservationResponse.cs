using System;

namespace Amply.Server.Dtos
{
    public class ReservationResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int Guests { get; set; }
    }
}
