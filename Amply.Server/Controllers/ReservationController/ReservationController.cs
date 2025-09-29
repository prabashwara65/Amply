using Amply.Server.Dtos;
using Amply.Server.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Amply.Server.Controllers
{
    [ApiController]
    [Route("api/v1/reservations")]
    public class ReservationController : ControllerBase
    {
        private readonly IMongoCollection<Reservation> _reservationCollection;

        public ReservationController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("usersDotNet");
            _reservationCollection = database.GetCollection<Reservation>("reservations");
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservations = await _reservationCollection.Find(_ => true).ToListAsync();
            return Ok(reservations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null) return NotFound();
            return Ok(reservation);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReservationRequest request)
        {
            var reservation = new Reservation
            {
                Name = request.Name,
                Email = request.Email,
                Date = request.Date,
                Guests = request.Guests
            };
            await _reservationCollection.InsertOneAsync(reservation);
            return Ok(reservation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ReservationRequest request)
        {
            var update = Builders<Reservation>.Update
                .Set(r => r.Name, request.Name)
                .Set(r => r.Email, request.Email)
                .Set(r => r.Date, request.Date)
                .Set(r => r.Guests, request.Guests);

            var result = await _reservationCollection.UpdateOneAsync(r => r.Id == id, update);
            if (result.MatchedCount == 0) return NotFound();

            return Ok(new { message = "Reservation updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _reservationCollection.DeleteOneAsync(r => r.Id == id);
            if (result.DeletedCount == 0) return NotFound();

            return Ok(new { message = "Reservation deleted successfully" });
        }
    }
}
