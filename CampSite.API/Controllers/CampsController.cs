using CampSite.API.DTOs;
using CampSite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CampSite.API.Controllers
{
    [ApiController]
    [Route("api/camps")]
    public class CampsController : ControllerBase
    {
        private readonly ICampService _campService;

        public CampsController(ICampService campService)
        {
            _campService = campService;
        }

        // GET api/camps
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableCamps(
            [FromQuery] DateTime? checkIn,
            [FromQuery] DateTime? checkOut,
            [FromQuery] int? capacity,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 6)
        {
            var searchDto = new CampSearchDto
            {
                CheckIn = checkIn ?? DateTime.Today,
                CheckOut = checkOut ?? DateTime.Today.AddDays(1),
                Capacity = capacity,
                Page = page,
                PageSize = pageSize
            };

            var result = await _campService.GetAvailableCampsAsync(searchDto);
            return Ok(result);
        }

        // GET api/camps/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var camp = await _campService.GetByIdAsync(id);
            if (camp == null)
                return NotFound(new { message = $"Camp {id} not found." });

            return Ok(camp);
        }

        // GET api/camps/admin/all
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var result = await _campService.GetAllCampsForAdminAsync();
            return Ok(result);
        }

        // POST api/camps
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CampCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _campService.CreateAsync(dto);

            return CreatedAtAction(nameof(GetById),
                new { id = created.Id }, created);
        }

        // PUT api/camps/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CampUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _campService.UpdateAsync(id, dto);
            return Ok(updated);
        }

        // DELETE api/camps/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _campService.DeleteAsync(id);
            return Ok(new { message = "Camp deleted successfully." });
        }
    }
}