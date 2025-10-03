
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
            // Check model state first
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate reservation date (within 7 days from today)
            var todayUtc = DateTime.UtcNow.Date;
            var maxDateUtc = todayUtc.AddDays(7);

            var reservationDateUtc = request.ReservationDate.ToUniversalTime().Date;

            if (reservationDateUtc < todayUtc || reservationDateUtc > maxDateUtc)
            {
                return BadRequest(new { message = "Reservation date must be within the next 7 days." });
            }

            // Create reservation
            var reservation = new Reservation
            {
                ReservationCode = $"RES-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                FullName = request.FullName,
                NIC = request.NIC ?? string.Empty,
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

            // get existing reservation
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found" });
            }

            // Reservation date must be within 7 days from today
            var today = DateTime.UtcNow.Date;
            var maxDate = today.AddDays(7);

            if (request.ReservationDate.Date < today || request.ReservationDate.Date > maxDate)
            {
                return BadRequest(new { message = "Reservation date must be within the next 7 days." });
            }

            // Updates must be made at least 12 hours before reservation start time
            var now = DateTime.UtcNow;
            var startDateTime = request.ReservationDate.Date + request.StartTime;
            if (startDateTime <= now.AddHours(12))
            {
                return BadRequest(new { message = "Updates must be made at least 12 hours before the reservation start time." });
            }

            // Update fields 
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
            // Find the reservation by id
            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            // Check if cancellation is allowed (at least 12 hours before start time)
            var now = DateTime.UtcNow;
            var reservationStartDateTime = reservation.ReservationDate.Date + reservation.StartTime;
            if (reservationStartDateTime <= now.AddHours(12))
            {
                return BadRequest(new { message = "Reservations can only be cancelled at least 12 hours before the start time." });
            }


            var result = await _reservationCollection.DeleteOneAsync(r => r.Id == id);
            if (result.DeletedCount == 0) return NotFound();

            return Ok(new { message = "Reservation deleted successfully" });
        }


        //get reservations status by id
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetStatus(string id)
        {
            //find reservation by id

            var reservation = await _reservationCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found" });
            }


            //Check if status is confirmed
            bool isConfirmed = reservation.Status.Equals("confirmed", StringComparison.OrdinalIgnoreCase);
            string? qrCodeBase64 = reservation.QrCode;

            if (isConfirmed && string.IsNullOrEmpty(qrCodeBase64))
                try
                {

                    //     //Encode reservation code for URL
                    // var encodedText = Uri.EscapeDataString(reservation.ReservationCode);
                    //     var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={encodedText}";

                    //     //convert the qr image from URL to Base64
                    //     using var httpClient = new HttpClient();
                    //     var imageBytes = await httpClient.GetByteArrayAsync(qrUrl);
                    //     qrCodeBase64 = $"data:image/png;base64,{Convert.ToBase64String(imageBytes)}";
                     
                      // Generate QR code as Base64 string
        qrCodeBase64 = GenerateQrCodeBase64(reservation.ReservationCode);

                        //Update qr code in database
                    var update = Builders<Reservation>.Update.Set(r => r.QrCode, qrCodeBase64)
                                                                 .Set(r => r.UpdatedAt, DateTime.UtcNow);
                       var updateResult= await _reservationCollection.UpdateOneAsync(r => r.Id == id, update);

                        if (updateResult.ModifiedCount == 0)
                        {
                            return NotFound(new { message = "QR code not generated" });
                        }

                }
                catch (HttpRequestException ex)
                {
                     return StatusCode(500, new { message = "Failed to generate QR code", detail = ex.Message });
                }

            //return status
                    return Ok(new
                    {
                        id = reservation.Id,
                        status = reservation.Status,
                        isConfirmed = isConfirmed,
                        qrCode = qrCodeBase64,
                        message = "QR code generated successfully"
                    });
        }

        private string GenerateQrCodeBase64(string text)
        {
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            byte[] qrCodeBytes = qrCode.GetGraphic(20);
            return $"data:image/png;base64,{Convert.ToBase64String(qrCodeBytes)}";
        }

    }
}
