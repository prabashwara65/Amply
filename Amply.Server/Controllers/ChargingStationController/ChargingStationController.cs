using Amply.Server.Dtos;
using Amply.Server.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Amply.Server.Controllers
{
    [ApiController]
    [Route("api/v1/charging-stations")]
    public class ChargingStationController : ControllerBase
    {
        private readonly IMongoCollection<ChargingStation> _chargingStationCollection;

        public ChargingStationController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("usersDotNet");
            _chargingStationCollection = database.GetCollection<ChargingStation>("chargingStations");
        }

        // Generate default schedule for new stations (7 days, 5 slots each)
        private List<ScheduleSlot> GenerateDefaultSchedule()
        {
            var schedule = new List<ScheduleSlot>();
            var today = DateTime.Today;
            
            for (int day = 0; day < 7; day++)
            {
                var currentDate = today.AddDays(day);
                
                for (int slot = 1; slot <= 5; slot++)
                {
                    schedule.Add(new ScheduleSlot
                    {
                        Date = currentDate,
                        IsAvailable = true,
                        SlotNumber = slot
                    });
                }
            }
            
            return schedule;
        }

        // Test endpoint
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Charging Station Controller is working!" });
        }

        // Get all charging stations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var chargingStations = await _chargingStationCollection.Find(_ => true).ToListAsync();

            var response = chargingStations.Select(cs => new ChargingStationResponse
            {
                Id = cs.Id,
                StationId = cs.StationId,
                StationName = cs.StationName,
                Location = new LocationResponse
                {
                    Address = cs.Location.Address,
                    Latitude = cs.Location.Latitude,
                    Longitude = cs.Location.Longitude,
                    City = cs.Location.City,
                    State = cs.Location.State,
                    Country = cs.Location.Country
                },
                Type = cs.Type,
                TotalSlots = cs.TotalSlots,
                AvailableSlots = cs.AvailableSlots,
                Schedule = cs.Schedule.Select(s => new ScheduleSlotResponse
                {
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    IsAvailable = s.IsAvailable,
                    SlotNumber = s.SlotNumber
                }).ToList(),
                OperatorId = cs.OperatorId,
                Status = cs.Status,
                ActiveBookings = cs.ActiveBookings,
                Timestamp = cs.Timestamp
            });
            return Ok(response);
        }

        // Get charging station by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null) return NotFound();

            var response = new ChargingStationResponse
            {
                Id = chargingStation.Id,
                StationId = chargingStation.StationId,
                StationName = chargingStation.StationName,
                Location = new LocationResponse
                {
                    Address = chargingStation.Location.Address,
                    Latitude = chargingStation.Location.Latitude,
                    Longitude = chargingStation.Location.Longitude,
                    City = chargingStation.Location.City,
                    State = chargingStation.Location.State,
                    Country = chargingStation.Location.Country
                },
                Type = chargingStation.Type,
                TotalSlots = chargingStation.TotalSlots,
                AvailableSlots = chargingStation.AvailableSlots,
                Schedule = chargingStation.Schedule.Select(s => new ScheduleSlotResponse
                {
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    IsAvailable = s.IsAvailable,
                    SlotNumber = s.SlotNumber
                }).ToList(),
                OperatorId = chargingStation.OperatorId,
                Status = chargingStation.Status,
                ActiveBookings = chargingStation.ActiveBookings,
                Timestamp = chargingStation.Timestamp
            };
            return Ok(response);
        }

        // Get available slots with timing information for a specific station
        [HttpGet("{id}/available-slots")]
        public async Task<IActionResult> GetAvailableSlots(string id)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null) 
                return NotFound(new { message = "Charging station not found" });

            // Get only available slots from schedule
            var availableSlots = chargingStation.Schedule
                .Where(s => s.IsAvailable)
                .Select(s => new
                {
                    date = s.Date,
                    slotNumber = s.SlotNumber,
                    startTime = s.StartTime,
                    endTime = s.EndTime,
                    isAvailable = s.IsAvailable
                })
                .OrderBy(s => s.date)
                .ThenBy(s => s.slotNumber)
                .ToList();

            var response = new
            {
                stationId = chargingStation.StationId,
                stationName = chargingStation.StationName,
                totalSlots = chargingStation.TotalSlots,
                availableSlots = chargingStation.AvailableSlots,
                remainingSlots = availableSlots.Count,
                slots = availableSlots
            };

            return Ok(response);
        }

        // Get available slots by station ID (custom field, not MongoDB _id)
        [HttpGet("station/{stationId}/available-slots")]
        public async Task<IActionResult> GetAvailableSlotsByStationId(string stationId)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.StationId == stationId).FirstOrDefaultAsync();
            if (chargingStation == null) 
                return NotFound(new { message = "Charging station not found" });

            // Get only available slots from schedule
            var availableSlots = chargingStation.Schedule
                .Where(s => s.IsAvailable)
                .Select(s => new
                {
                    date = s.Date,
                    slotNumber = s.SlotNumber,
                    startTime = s.StartTime,
                    endTime = s.EndTime,
                    isAvailable = s.IsAvailable
                })
                .OrderBy(s => s.date)
                .ThenBy(s => s.slotNumber)
                .ToList();

            var response = new
            {
                stationId = chargingStation.StationId,
                stationName = chargingStation.StationName,
                totalSlots = chargingStation.TotalSlots,
                availableSlots = chargingStation.AvailableSlots,
                remainingSlots = availableSlots.Count,
                slots = availableSlots
            };

            return Ok(response);
        }

        // Get available slots for a specific date and station
        [HttpGet("{id}/available-slots/date/{date}")]
        public async Task<IActionResult> GetAvailableSlotsByDate(string id, DateTime date)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null) 
                return NotFound(new { message = "Charging station not found" });

            var targetDate = date.Date;
            
            // Get available slots for the specific date
            var availableSlots = chargingStation.Schedule
                .Where(s => s.Date.Date == targetDate && s.IsAvailable)
                .Select(s => new
                {
                    date = s.Date,
                    slotNumber = s.SlotNumber,
                    startTime = s.StartTime,
                    endTime = s.EndTime,
                    isAvailable = s.IsAvailable
                })
                .OrderBy(s => s.slotNumber)
                .ToList();

            var response = new
            {
                stationId = chargingStation.StationId,
                stationName = chargingStation.StationName,
                date = targetDate,
                availableSlotsForDate = availableSlots.Count,
                totalSlotsForDate = chargingStation.Schedule.Count(s => s.Date.Date == targetDate),
                slots = availableSlots
            };

            return Ok(response);
        }

        // Create a new charging station
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ChargingStationRequest request)
        {
            // Check model state first
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Generate default schedule if not provided
            var defaultSchedule = GenerateDefaultSchedule();

            // Check if stationId already exists
            var existingStation = await _chargingStationCollection.Find(cs => cs.StationId == request.StationId).FirstOrDefaultAsync();
            if (existingStation != null)
            {
                return BadRequest(new { message = "Station ID already exists." });
            }

            // Create charging station
            var chargingStation = new ChargingStation
            {
                StationId = request.StationId,
                StationName = request.StationName,
                Location = new Location
                {
                    Address = request.Location.Address,
                    Latitude = request.Location.Latitude,
                    Longitude = request.Location.Longitude,
                    City = request.Location.City ?? string.Empty,
                    State = request.Location.State ?? string.Empty,
                    Country = request.Location.Country ?? string.Empty
                },
                Type = request.Type,
                TotalSlots = 35, // 7 days * 5 slots = 35 total slots
                AvailableSlots = 35, // Initially all slots are available
                Schedule = defaultSchedule, // Use generated default schedule
                OperatorId = request.OperatorId,
                Status = request.Status,
                ActiveBookings = 0,
                Timestamp = DateTime.UtcNow
            };

            await _chargingStationCollection.InsertOneAsync(chargingStation);

            var response = new ChargingStationResponse
            {
                Id = chargingStation.Id,
                StationId = chargingStation.StationId,
                StationName = chargingStation.StationName,
                Location = new LocationResponse
                {
                    Address = chargingStation.Location.Address,
                    Latitude = chargingStation.Location.Latitude,
                    Longitude = chargingStation.Location.Longitude,
                    City = chargingStation.Location.City,
                    State = chargingStation.Location.State,
                    Country = chargingStation.Location.Country
                },
                Type = chargingStation.Type,
                TotalSlots = chargingStation.TotalSlots,
                AvailableSlots = chargingStation.AvailableSlots,
                Schedule = chargingStation.Schedule.Select(s => new ScheduleSlotResponse
                {
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    IsAvailable = s.IsAvailable,
                    SlotNumber = s.SlotNumber
                }).ToList(),
                OperatorId = chargingStation.OperatorId,
                Status = chargingStation.Status,
                ActiveBookings = chargingStation.ActiveBookings,
                Timestamp = chargingStation.Timestamp
            };

            return Ok(response);
        }

        // Update a charging station
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ChargingStationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get existing charging station
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null)
            {
                return NotFound(new { message = "Charging station not found" });
            }

            // Validate available slots
            if (request.AvailableSlots > request.TotalSlots)
            {
                return BadRequest(new { message = "Available slots cannot be greater than total slots." });
            }

            // Update fields
            var update = Builders<ChargingStation>.Update
                .Set(cs => cs.StationId, request.StationId)
                .Set(cs => cs.StationName, request.StationName)
                .Set(cs => cs.Location, new Location
                {
                    Address = request.Location.Address,
                    Latitude = request.Location.Latitude,
                    Longitude = request.Location.Longitude,
                    City = request.Location.City ?? string.Empty,
                    State = request.Location.State ?? string.Empty,
                    Country = request.Location.Country ?? string.Empty
                })
                .Set(cs => cs.Type, request.Type)
                .Set(cs => cs.TotalSlots, request.TotalSlots)
                .Set(cs => cs.AvailableSlots, request.AvailableSlots)
                .Set(cs => cs.Schedule, request.Schedule.Select(s => new ScheduleSlot
                {
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    IsAvailable = s.IsAvailable,
                    SlotNumber = s.SlotNumber
                }).ToList())
                .Set(cs => cs.OperatorId, request.OperatorId)
                .Set(cs => cs.Status, request.Status)
                .Set(cs => cs.Timestamp, DateTime.UtcNow);

            var result = await _chargingStationCollection.UpdateOneAsync(cs => cs.Id == id, update);
            if (result.MatchedCount == 0) return NotFound();

            return Ok(new { message = "Charging station updated successfully" });
        }

        // Delete a charging station
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            // Check if station has active bookings
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null)
            {
                return NotFound(new { message = "Charging station not found" });
            }

            if (chargingStation.ActiveBookings > 0)
            {
                return BadRequest(new { message = "Cannot delete charging station with active bookings" });
            }

            var result = await _chargingStationCollection.DeleteOneAsync(cs => cs.Id == id);
            if (result.DeletedCount == 0) return NotFound();

            return Ok(new { message = "Charging station deleted successfully" });
        }

        // Deactivate a charging station
        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(string id, [FromBody] DeactivationRequest? request = null)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null)
            {
                return NotFound(new { message = "Charging station not found" });
            }

            if (chargingStation.ActiveBookings > 0)
            {
                return BadRequest(new { message = "Cannot deactivate charging station with active bookings" });
            }

            var update = Builders<ChargingStation>.Update
                .Set(cs => cs.Status, "Inactive")
                .Set(cs => cs.Timestamp, DateTime.UtcNow);

            var result = await _chargingStationCollection.UpdateOneAsync(cs => cs.Id == id, update);
            if (result.MatchedCount == 0) return NotFound();

            return Ok(new { message = "Charging station deactivated successfully" });
        }

        // Activate a charging station
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(string id)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null)
            {
                return NotFound(new { message = "Charging station not found" });
            }

            var update = Builders<ChargingStation>.Update
                .Set(cs => cs.Status, "Active")
                .Set(cs => cs.Timestamp, DateTime.UtcNow);

            var result = await _chargingStationCollection.UpdateOneAsync(cs => cs.Id == id, update);
            if (result.MatchedCount == 0) return NotFound();

            return Ok(new { message = "Charging station activated successfully" });
        }

        // Update station schedule/slots
        [HttpPut("{id}/schedule")]
        public async Task<IActionResult> UpdateSchedule(string id, [FromBody] ScheduleUpdateRequest request)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null)
            {
                return NotFound(new { message = "Charging station not found" });
            }

            // This is a placeholder for schedule management
            // You would implement actual schedule logic here
            return Ok(new { message = "Schedule updated successfully" });
        }

        // Get station availability
        [HttpGet("{id}/availability")]
        public async Task<IActionResult> GetAvailability(string id)
        {
            var chargingStation = await _chargingStationCollection.Find(cs => cs.Id == id).FirstOrDefaultAsync();
            if (chargingStation == null)
            {
                return NotFound(new { message = "Charging station not found" });
            }

            // This is a placeholder for availability logic
            // You would implement actual availability checking here
            return Ok(new
            {
                stationId = id,
                availableSlots = chargingStation.AvailableSlots,
                totalSlots = chargingStation.TotalSlots,
                status = chargingStation.Status
            });
        }

        //get all active charging stations
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveStations()
        {

            //fetch stations with status = "Active"
            var activeStations = await _chargingStationCollection.Find(cs => cs.Status == "Active").ToListAsync();

            if (!activeStations.Any())
            {
                return NotFound(new { message = "No active charging stations found" });
            }
            //Map to response DTO
            var response = activeStations.Select(cs => new ChargingStationResponse
            {
                Id = cs.Id,
                StationId = cs.StationId,
                StationName = cs.StationName,
                Location = new LocationResponse
                {
                    Address = cs.Location.Address,
                    Latitude = cs.Location.Latitude,
                    Longitude = cs.Location.Longitude,
                    City = cs.Location.City,
                    State = cs.Location.State,
                    Country = cs.Location.Country
                },
                Type = cs.Type,
                TotalSlots = cs.TotalSlots,
                AvailableSlots = cs.AvailableSlots,
                Schedule = cs.Schedule.Select(s => new ScheduleSlotResponse
                {
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    IsAvailable = s.IsAvailable,
                    SlotNumber = s.SlotNumber
                }).ToList(),
                OperatorId = cs.OperatorId,
                Status = cs.Status,
                ActiveBookings = cs.ActiveBookings,
                Timestamp = cs.Timestamp
            });

            return Ok(response);
        }
    }

        public class DeactivationRequest
        {
            public string? Reason { get; set; }
        }

        public class ScheduleUpdateRequest
        {
            public string Action { get; set; } = string.Empty;
            public object? Slot { get; set; }
            public string? SlotId { get; set; }
            public bool? IsAvailable { get; set; }
        }
    }

