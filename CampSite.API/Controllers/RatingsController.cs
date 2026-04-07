using CampSite.API.DTOs;
using CampSite.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CampSite.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingsController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingsController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        // POST api/ratings
        [HttpPost]
        public async Task<IActionResult> AddRating(
            [FromBody] RatingRequestDto dto)
        {
            var result = await _ratingService.AddRatingAsync(dto);
            return Ok(result);
        }

        // PUT api/ratings
        [HttpPut]
        public async Task<IActionResult> UpdateRating(
            [FromBody] RatingRequestDto dto)
        {
            var result = await _ratingService.UpdateRatingAsync(dto);
            return Ok(result);
        }
    }
}