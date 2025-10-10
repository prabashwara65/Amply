/***************************************************************
 * Project      : Amply EV Charging Management System
 * File Name    : OwnerProfileController.cs
 * Author       : Sithmi Himanshi
 * Created Date : 2025-10-10
 * Description  : This controller manages CRUD operations for EV 
 *                Owner profiles including activation, deactivation,
 *                reactivation, and authentication.
 * 
 * Last Modified: 2025-10-10
 * Modified By  : Sithmi Himanshi
 * Version      : 1.0
 ***************************************************************/

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

        // GET: api/v1/userprofiles
        // Retrieves all EV owner profiles from the database
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var owners = await _ownerCollection.Find(_ => true).ToListAsync();
            var response = owners.Select(o => new OwnerProfileResponse
            {
                NIC = o.NIC,
                FullName = o.FullName,
                Email = o.Email,
                Password = o.Password, // show password
                Phone = o.Phone,
                Status = o.Status,
                Role = o.Role,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt
            }).ToList();

            return Ok(response);
        }

        // GET: api/v1/userprofiles/{nic}
        // Retrieves a specific EV owner profile by NIC
        [HttpGet("{nic}")]
        public async Task<IActionResult> GetByNIC(string nic)
        {
            var owner = await _ownerCollection.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null)
                return NotFound(new { message = "Owner profile not found." });

            var response = new OwnerProfileResponse
            {
                NIC = owner.NIC,
                FullName = owner.FullName,
                Email = owner.Email,
                Password = owner.Password, // show password
                Phone = owner.Phone,
                Status = owner.Status,
                Role = owner.Role,
                CreatedAt = owner.CreatedAt,
                UpdatedAt = owner.UpdatedAt
            };

            return Ok(response);
        }

        // POST: api/v1/userprofiles
        // Creates a new EV owner profile
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OwnerProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _ownerCollection.Find(o => o.NIC == request.NIC).AnyAsync();
            if (exists)
                return BadRequest(new { message = "Owner profile with this NIC already exists." });

            var owner = new OwnerProfile
            {
                NIC = request.NIC,
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password, // show password
                Phone = request.Phone,
                Status = "active",
                Role = "EvOwner", // always EvOwner
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _ownerCollection.InsertOneAsync(owner);

            var response = new OwnerProfileResponse
            {
                NIC = owner.NIC,
                FullName = owner.FullName,
                Email = owner.Email,
                Password = owner.Password, // show password
                Phone = owner.Phone,
                Status = owner.Status,
                Role = owner.Role,
                CreatedAt = owner.CreatedAt,
                UpdatedAt = owner.UpdatedAt
            };

            return Ok(response);
        }

        // PUT: api/v1/userprofiles/{nic}
        // Updates an existing EV owner profile
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
                .Set(o => o.Password, request.Password) // show password
                .Set(o => o.Phone, request.Phone)
                .Set(o => o.Status, request.Status)
                .Set(o => o.UpdatedAt, DateTime.UtcNow);

            await _ownerCollection.UpdateOneAsync(o => o.NIC == nic, update);

            return Ok(new { message = "Owner profile updated successfully" });
        }

        // DELETE: api/v1/userprofiles/{nic}
        // Deletes an EV owner profile by NIC
        [HttpDelete("{nic}")]
        public async Task<IActionResult> Delete(string nic)
        {
            var result = await _ownerCollection.DeleteOneAsync(o => o.NIC == nic);
            if (result.DeletedCount == 0)
                return NotFound(new { message = "Owner profile not found." });

            return Ok(new { message = "Owner profile deleted successfully" });
        }

// PUT: api/v1/userprofiles/{nic}/deactivate
// Deactivates an EV owner profile
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

// PUT: api/v1/userprofiles/{nic}/request-reactivate
// Requests reactivation of an EV owner profile
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

// PUT: api/v1/userprofiles/{nic}/activate
// Activates an EV owner profile
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
        // Optional: Login by Email & Password
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var owner = await _ownerCollection
                .Find(o => o.Email == request.Email && o.Password == request.Password)
                .FirstOrDefaultAsync();

            if (owner == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var response = new OwnerProfileResponse
            {
                NIC = owner.NIC,
                FullName = owner.FullName,
                Email = owner.Email,
                Password = owner.Password, // show password
                Phone = owner.Phone,
                Role = owner.Role,
                CreatedAt = owner.CreatedAt,
                UpdatedAt = owner.UpdatedAt
            };

            return Ok(response);
        }

    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
