using CampSite.API.DTOs;

namespace CampSite.API.Services
{
    public interface IRatingService
    {
        Task<RatingResponseDto> AddRatingAsync(RatingRequestDto dto);
        Task<RatingResponseDto> UpdateRatingAsync(RatingRequestDto dto);
    }
}