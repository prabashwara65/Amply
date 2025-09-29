using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace Amply.Server.Models
{
    public class Reservation
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("date")]
        public DateTime Date { get; set; }

        [BsonElement("guests")]
        public int Guests { get; set; }
    }
}
