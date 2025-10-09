
using Amply.Server.Dtos;
using Amply.Server.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using QRCoder;

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

        // Get all reservations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservations = await _reservationCollection.Find(_ => true).ToListAsync();

            var response = new List<ReservationResponse>();

            foreach (var r in reservations)
            {
                string? qrCodeBase64 = r.QrCode;

                // Generate QR if confirmed and QR not yet created
                if (r.Status.Equals("confirmed", StringComparison.OrdinalIgnoreCase) && string.IsNullOrEmpty(qrCodeBase64))
                {
                    qrCodeBase64 = GenerateQrCodeBase64(r.ReservationCode, r.FullName, r.SlotNo, r.StartTime, r.EndTime, r.VehicleNumber);

                    // Update DB 
                    var update = Builders<Reservation>.Update
                        .Set(x => x.QrCode, qrCodeBase64)
                        .Set(x => x.UpdatedAt, DateTime.UtcNow);

                    await _reservationCollection.UpdateOneAsync(x => x.Id == r.Id, update);
                }

                response.Add(new ReservationResponse
                {
                    Id = r.Id,
                    ReservationCode = r.ReservationCode,
                    FullName = r.FullName,
                    NIC = r.NIC,
                    VehicleNumber = r.VehicleNumber,
                    StationId = r.StationId,
                    StationName = r.StationName,
                    SlotNo = r.SlotNo,
                    BookingDate = r.BookingDate,
                    ReservationDate = r.ReservationDate,
                    StartTime = r.StartTime,
                    EndTime = r.EndTime,
                    Status = r.Status,
                    QrCode = qrCodeBase64,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                });
            }

            return Ok(response);
        }

        // Get reservation by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var r = await _reservationCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (r == null) return NotFound();

            var response = new ReservationResponse
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                FullName = r.FullName,
                NIC = r.NIC,
                VehicleNumber = r.VehicleNumber,
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
            };
            return Ok(response);
        }

        // Get reservations by station ID
        [HttpGet("station/{stationId}")]
        public async Task<IActionResult> GetByStationId(string stationId)
        {
            var reservations = await _reservationCollection.Find(r => r.StationId == stationId).ToListAsync();

            var response = reservations.Select(r => new ReservationResponse
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                FullName = r.FullName,
                NIC = r.NIC,
                VehicleNumber = r.VehicleNumber,
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
            }).ToList();

            return Ok(response);
        }

        // Get reservations by station name
        [HttpGet("station-name/{stationName}")]
        public async Task<IActionResult> GetByStationName(string stationName)
        {
            var reservations = await _reservationCollection.Find(r => r.StationName == stationName).ToListAsync();

            var response = reservations.Select(r => new ReservationResponse
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                FullName = r.FullName,
                NIC = r.NIC,
                VehicleNumber = r.VehicleNumber,
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
            }).ToList();

            return Ok(response);
        }

        // Create a new reservation
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReservationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var todayUtc = DateTime.UtcNow.Date;
            var maxDateUtc = todayUtc.AddDays(7);
            var reservationDateUtc = request.ReservationDate.ToUniversalTime().Date;

            if (reservationDateUtc < todayUtc || reservationDateUtc > maxDateUtc)
                return BadRequest(new { message = "Reservation date must be within the next 7 days." });

            var reservation = new Reservation
            {
                ReservationCode = $"RES-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                FullName = request.FullName,
                NIC = request.NIC ?? string.Empty,
                VehicleNumber = request.VehicleNumber,
                StationId = request.StationId,
                StationName = request.StationName,
                SlotNo = request.SlotNo,
                BookingDate = DateTime.UtcNow,
                ReservationDate = request.ReservationDate.ToUniversalTime(),
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
                VehicleNumber = reservation.VehicleNumber,
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

        // Update a reservation
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ReservationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            var today = DateTime.UtcNow.Date;
            var maxDate = today.AddDays(7);

            if (request.ReservationDate.Date < today || request.ReservationDate.Date > maxDate)
                return BadRequest(new { message = "Reservation date must be within the next 7 days." });

            var now = DateTime.UtcNow;
            var startDateTime = request.ReservationDate.Date + request.StartTime;
            if (startDateTime <= now.AddHours(12))
                return BadRequest(new { message = "Updates must be made at least 12 hours before the reservation start time." });

            var update = Builders<Reservation>.Update
                .Set(r => r.FullName, request.FullName)
                .Set(r => r.NIC, request.NIC ?? string.Empty)
                 .Set(r => r.VehicleNumber, request.VehicleNumber)
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

        // Delete a reservation
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            var now = DateTime.UtcNow;
            var reservationStartDateTime = reservation.ReservationDate.Date + reservation.StartTime;
            if (reservationStartDateTime <= now.AddHours(12))
                return BadRequest(new { message = "Reservations can only be cancelled at least 12 hours before the start time." });

            var result = await _reservationCollection.DeleteOneAsync(r => r.Id == id);
            if (result.DeletedCount == 0) return NotFound();

            return Ok(new { message = "Reservation deleted successfully" });
        }

        // Get reservation status by id
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetStatus(string id)
        {
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            bool isConfirmed = reservation.Status.Equals("confirmed", StringComparison.OrdinalIgnoreCase);
            string? qrCodeBase64 = reservation.QrCode;

            if (isConfirmed && string.IsNullOrEmpty(qrCodeBase64))
            {
                try
                {
                    qrCodeBase64 = GenerateQrCodeBase64(reservation.ReservationCode, reservation.FullName, reservation.SlotNo, reservation.StartTime, reservation.EndTime, reservation.VehicleNumber);

                    var update = Builders<Reservation>.Update
                        .Set(r => r.QrCode, qrCodeBase64)
                        .Set(r => r.UpdatedAt, DateTime.UtcNow);

                    await _reservationCollection.UpdateOneAsync(r => r.Id == id, update);
                }
                catch (HttpRequestException ex)
                {
                    return StatusCode(500, new { message = "Failed to generate QR code", detail = ex.Message });
                }
            }

            return Ok(new
            {
                id = reservation.Id,
                status = reservation.Status,
                isConfirmed,
                qrCode = qrCodeBase64,
                message = "QR code generated successfully"
            });
        }

        // Confirm a reservation (EV operator confirms pending reservation)
        [HttpPatch("{id}/confirm")]
        public async Task<IActionResult> ConfirmReservation(string id)
        {
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            // Only pending reservations can be confirmed
            if (!reservation.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = $"Cannot confirm reservation with status: {reservation.Status}" });

            // Generate QR code when confirming
            string qrCodeBase64 = GenerateQrCodeBase64(
                reservation.ReservationCode, 
                reservation.FullName, 
                reservation.SlotNo, 
                reservation.StartTime, 
                reservation.EndTime, 
                reservation.VehicleNumber
            );

            var update = Builders<Reservation>.Update
                .Set(r => r.Status, "Confirmed")
                .Set(r => r.QrCode, qrCodeBase64)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);

            var result = await _reservationCollection.UpdateOneAsync(r => r.Id == id, update);
            if (result.MatchedCount == 0)
                return NotFound(new { message = "Reservation not found" });

            var updatedReservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();

            var response = new ReservationResponse
            {
                Id = updatedReservation.Id,
                ReservationCode = updatedReservation.ReservationCode,
                FullName = updatedReservation.FullName,
                NIC = updatedReservation.NIC,
                VehicleNumber = updatedReservation.VehicleNumber,
                StationId = updatedReservation.StationId,
                StationName = updatedReservation.StationName,
                SlotNo = updatedReservation.SlotNo,
                BookingDate = updatedReservation.BookingDate,
                ReservationDate = updatedReservation.ReservationDate,
                StartTime = updatedReservation.StartTime,
                EndTime = updatedReservation.EndTime,
                Status = updatedReservation.Status,
                QrCode = updatedReservation.QrCode,
                CreatedAt = updatedReservation.CreatedAt,
                UpdatedAt = updatedReservation.UpdatedAt
            };

            return Ok(response);
        }

        private string GenerateQrCodeBase64(string reservationCode, string fullName, int slotNo, TimeSpan startTime, TimeSpan endTime, string vehicleNumber)
        {
            var qrContent = new
            {
                reservationCode,
                fullName,
                slotNo,
                startTime,
                endTime,
                vehicleNumber
            };

            string qrText = System.Text.Json.JsonSerializer.Serialize(qrContent);

            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(qrText, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            byte[] qrCodeBytes = qrCode.GetGraphic(20);
            return $"data:image/png;base64,{Convert.ToBase64String(qrCodeBytes)}";
        }
    }
}
