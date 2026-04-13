using CampSite.API.DTOs;
using CampSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CampSite.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto);

            if (!result.Success)
                return Unauthorized(new { message = "Invalid email or password" });

            return Ok(result);
        }

        // POST: api/auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(dto);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(result);
        }
    }
}