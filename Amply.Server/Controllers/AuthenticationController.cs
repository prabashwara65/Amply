using Amply.Server.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Amply.Server.Controllers
{
    [ApiController]
    [Route("api/v1/authenticate")]
    public class AuthenticationController : ControllerBase
    {
        [HttpPost]
        [Route("login")]
        [ProducesResponseType((int) HttpStatusCode.OK , typeof(LoginResponse))]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await LoginAsync(request);

        }

        private async Task LoginAsync(LoginRequest request)
        {
            throw new NotImplementedException();
        }
    }
    
        
    
}
