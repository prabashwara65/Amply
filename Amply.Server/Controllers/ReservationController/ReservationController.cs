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

        //get all reservations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservations = await _reservationCollection.Find(_ => true).ToListAsync();

            var response = reservations.Select(r => new ReservationResponse
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                FullName = r.FullName,
                NIC = r.NIC,
                StationId = r.StationId,
                StationName = r.StationName,
                SlotNo = r.SlotNo,
                BookingDate = r.BookingDate,
                ReservationDate = r.ReservationDate,
                StartTime = r.StartTime,
                EndTime = r.EndTime,
                Status = r.Status,
                QrCode = r.QrCode,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            });
            return Ok(response);
        }


        //get reservation by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null) return NotFound();
            
            var response = new ReservationResponse
            {
                Id = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                FullName = reservation.FullName,
                NIC = reservation.NIC,
                StationId = reservation.StationId,
                StationName = reservation.StationName,
                SlotNo = reservation.SlotNo,
                BookingDate = reservation.BookingDate,
                ReservationDate = reservation.ReservationDate,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                Status = reservation.Status,
                QrCode = reservation.QrCode,
                CreatedAt = reservation.CreatedAt,
                UpdatedAt = reservation.UpdatedAt
            };
            return Ok(response);
        }

        //create a new reservation
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReservationRequest request)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var reservation = new Reservation
            {
                ReservationCode = $"RES-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                FullName = request.FullName,
                NIC = request.NIC ?? string.Empty,
                StationId = request.StationId,
                StationName = request.StationName,
                SlotNo = request.SlotNo,
                BookingDate = DateTime.UtcNow,
                ReservationDate = request.ReservationDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _reservationCollection.InsertOneAsync(reservation);

            var response = new ReservationResponse
            {
                Id = reservation.Id,
                ReservationCode = reservation.ReservationCode,
                FullName = reservation.FullName,
                NIC = reservation.NIC,
                StationId = reservation.StationId,
                StationName = reservation.StationName,
                SlotNo = reservation.SlotNo,
                BookingDate = reservation.BookingDate,
                ReservationDate = reservation.ReservationDate,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                Status = reservation.Status,
                QrCode = reservation.QrCode,
                CreatedAt = reservation.CreatedAt,
                UpdatedAt = reservation.UpdatedAt
            };

            return Ok(response);
        }


        //update a reservation
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ReservationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var update = Builders<Reservation>.Update
                .Set(r => r.FullName, request.FullName)
                .Set(r => r.NIC, request.NIC ?? string.Empty)
                .Set(r => r.StationId, request.StationId)
                .Set(r => r.StationName, request.StationName)
                .Set(r => r.SlotNo, request.SlotNo)
                .Set(r => r.ReservationDate, request.ReservationDate)
                .Set(r => r.StartTime, request.StartTime)
                .Set(r => r.EndTime, request.EndTime)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _reservationCollection.UpdateOneAsync(r => r.Id == id, update);
            if (result.MatchedCount == 0) return NotFound();

            return Ok(new { message = "Reservation updated successfully" });
        }
        
        //delete a reservation
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _reservationCollection.DeleteOneAsync(r => r.Id == id);
            if (result.DeletedCount == 0) return NotFound();

            return Ok(new { message = "Reservation deleted successfully" });
        }
    }
}
