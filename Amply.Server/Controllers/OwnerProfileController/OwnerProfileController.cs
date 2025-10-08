using Amply.Server.Dtos;
using Amply.Server.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Amply.Server.Controllers
{
    [ApiController]
    [Route("api/v1/userprofiles")]
    public class OwnerProfileController : ControllerBase
    {
        private readonly IMongoCollection<OwnerProfile> _ownerCollection;

        public OwnerProfileController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("usersDotNet");
            _ownerCollection = database.GetCollection<OwnerProfile>("userprofiles");
        }

        // Get all owner profiles
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var owners = await _ownerCollection.Find(_ => true).ToListAsync();
            var response = owners.Select(o => new OwnerProfileResponse
            {
                NIC = o.NIC,
                FullName = o.FullName,
                Email = o.Email,
                Phone = o.Phone,
                Status = o.Status,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt
            }).ToList();
            return Ok(response);
        }

        // Get owner profile by NIC
        [HttpGet("{nic}")]
        public async Task<IActionResult> GetByNIC(string nic)
        {
            var owner = await _ownerCollection.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) return NotFound();

            var response = new OwnerProfileResponse
            {
                NIC = owner.NIC,
                FullName = owner.FullName,
                Email = owner.Email,
                Phone = owner.Phone,
                Status = owner.Status,
                CreatedAt = owner.CreatedAt,
                UpdatedAt = owner.UpdatedAt
            };
            return Ok(response);
        }

        // Create new owner profile
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OwnerProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if NIC already exists
            var exists = await _ownerCollection.Find(o => o.NIC == request.NIC).AnyAsync();
            if (exists)
                return BadRequest(new { message = "Owner profile with this NIC already exists." });

            var owner = new OwnerProfile
            {
                NIC = request.NIC,
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password, // Consider hashing in production
                Phone = request.Phone,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _ownerCollection.InsertOneAsync(owner);

            var response = new OwnerProfileResponse
            {
                NIC = owner.NIC,
                FullName = owner.FullName,
                Email = owner.Email,
                Phone = owner.Phone,
                Status = owner.Status,
                CreatedAt = owner.CreatedAt,
                UpdatedAt = owner.UpdatedAt
            };

            return Ok(response);
        }

        // Update owner profile
        [HttpPut("{nic}")]
        public async Task<IActionResult> Update(string nic, [FromBody] OwnerProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var owner = await _ownerCollection.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null)
                return NotFound(new { message = "Owner profile not found." });

            var update = Builders<OwnerProfile>.Update
                .Set(o => o.FullName, request.FullName)
                .Set(o => o.Email, request.Email)
                .Set(o => o.Password, request.Password)
                .Set(o => o.Phone, request.Phone)
                .Set(o => o.UpdatedAt, DateTime.UtcNow);

            var result = await _ownerCollection.UpdateOneAsync(o => o.NIC == nic, update);
            if (result.MatchedCount == 0) return NotFound();

            return Ok(new { message = "Owner profile updated successfully" });
        }

        // Delete owner profile
        [HttpDelete("{nic}")]
        public async Task<IActionResult> Delete(string nic)
        {
            var result = await _ownerCollection.DeleteOneAsync(o => o.NIC == nic);
            if (result.DeletedCount == 0)
                return NotFound(new { message = "Owner profile not found." });

            return Ok(new { message = "Owner profile deleted successfully" });
        }

        [HttpPut("{nic}/deactivate")]
public async Task<IActionResult> Deactivate(string nic)
{
    var update = Builders<OwnerProfile>.Update
        .Set(o => o.Status, "deactive")
        .Set(o => o.UpdatedAt, DateTime.UtcNow);
    var result = await _ownerCollection.UpdateOneAsync(o => o.NIC == nic, update);
    if (result.MatchedCount == 0) return NotFound();
    return Ok(new { message = "Profile deactivated" });
}

[HttpPut("{nic}/request-reactivate")]
public async Task<IActionResult> RequestReactivate(string nic)
{
    var update = Builders<OwnerProfile>.Update
        .Set(o => o.Status, "requested to reactivate")
        .Set(o => o.UpdatedAt, DateTime.UtcNow);
    var result = await _ownerCollection.UpdateOneAsync(o => o.NIC == nic, update);
    if (result.MatchedCount == 0) return NotFound();
    return Ok(new { message = "Reactivation requested" });
}

[HttpPut("{nic}/activate")]
public async Task<IActionResult> Activate(string nic)
{
    var update = Builders<OwnerProfile>.Update
        .Set(o => o.Status, "active")
        .Set(o => o.UpdatedAt, DateTime.UtcNow);
    var result = await _ownerCollection.UpdateOneAsync(o => o.NIC == nic, update);
    if (result.MatchedCount == 0) return NotFound();
    return Ok(new { message = "Profile activated" });
}
    }
}