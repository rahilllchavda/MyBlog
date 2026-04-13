using CampSite.API.DTOs;
using CampSite.API.Models;
using CampSite.API.Repositories;

namespace CampSite.API.Services
{
    public class CampService : ICampService
    {
        private readonly ICampRepository _campRepository;

        public CampService(ICampRepository campRepository)
        {
            _campRepository = campRepository;
        }

        public async Task<PagedCampResponseDto> GetAvailableCampsAsync(
            CampSearchDto searchDto)
        {
            if (searchDto.CheckIn >= searchDto.CheckOut)
                throw new InvalidOperationException(
                    "Check-out must be after check-in.");

            var camps      = await _campRepository.GetAvailableCampsAsync(
                                 searchDto.CheckIn,
                                 searchDto.CheckOut,
                                 searchDto.Capacity);
            var campList   = camps.ToList();
            var totalCount = campList.Count;
            var totalPages = (int)Math.Ceiling(
                                 totalCount / (double)searchDto.PageSize);

            var paged = campList
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .Select(c => MapToResponseDto(c))
                .ToList();

            return new PagedCampResponseDto
            {
                Camps      = paged,
                TotalCount = totalCount,
                Page       = searchDto.Page,
                PageSize   = searchDto.PageSize,
                TotalPages = totalPages
            };
        }

        public async Task<CampResponseDto?> GetByIdAsync(int id)
        {
            var camp = await _campRepository.GetByIdAsync(id);
            return camp == null ? null : MapToResponseDto(camp);
        }

        public async Task<CampResponseDto> CreateAsync(CampCreateDto dto)
        {
            var camp = new Camp
            {
                Name                 = dto.Name,
                Description          = dto.Description,
                Location             = dto.Location,
                ImageUrl             = dto.ImageUrl,
                Capacity             = dto.Capacity,
                PricePerNight        = dto.PricePerNight,
                WeekendPricePerNight = dto.WeekendPricePerNight,
                IsActive             = true,
                CreatedAt            = DateTime.UtcNow
            };
            var created = await _campRepository.CreateAsync(camp);
            return MapToResponseDto(created);
        }

        public async Task<CampResponseDto> UpdateAsync(int id, CampUpdateDto dto)
        {
            var camp = await _campRepository.GetByIdAsync(id);
            if (camp == null)
                throw new KeyNotFoundException($"Camp {id} not found.");

            camp.Name                 = dto.Name;
            camp.Description          = dto.Description;
            camp.Location             = dto.Location;
            camp.ImageUrl             = dto.ImageUrl;
            camp.Capacity             = dto.Capacity;
            camp.PricePerNight        = dto.PricePerNight;
            camp.WeekendPricePerNight = dto.WeekendPricePerNight;
            camp.IsActive             = dto.IsActive;

            var updated = await _campRepository.UpdateAsync(camp);
            return MapToResponseDto(updated);
        }

        public async Task DeleteAsync(int id)
        {
            if (!await _campRepository.ExistsAsync(id))
                throw new KeyNotFoundException($"Camp {id} not found.");
            await _campRepository.DeleteAsync(id);
        }

        // ── Dynamic Pricing ───────────────────────────────────
        private static decimal GetPriceForDate(Camp camp, DateTime date)
        {
            bool isWeekend =
                date.DayOfWeek == DayOfWeek.Friday   ||
                date.DayOfWeek == DayOfWeek.Saturday ||
                date.DayOfWeek == DayOfWeek.Sunday;

            return isWeekend && camp.WeekendPricePerNight.HasValue
                ? camp.WeekendPricePerNight.Value
                : camp.PricePerNight;
        }

        public static decimal CalculateTotalPrice(
            Camp camp, DateTime checkIn, DateTime checkOut)
        {
            decimal total   = 0;
            var     current = checkIn;
            while (current < checkOut)
            {
                total  += GetPriceForDate(camp, current);
                current = current.AddDays(1);
            }
            return total;
        }

        // ── Mapper ────────────────────────────────────────────
        private static CampResponseDto MapToResponseDto(Camp camp)
        {
            var avg = camp.Ratings.Any()
                ? camp.Ratings.Average(r => r.Stars)
                : 0.0;

            return new CampResponseDto
            {
                Id                   = camp.Id,
                Name                 = camp.Name,
                Description          = camp.Description,
                Location             = camp.Location,
                ImageUrl             = camp.ImageUrl,
                Capacity             = camp.Capacity,
                PricePerNight        = camp.PricePerNight,
                WeekendPricePerNight = camp.WeekendPricePerNight,
                IsActive             = camp.IsActive,
                AverageRating        = Math.Round(avg, 1),
                TotalRatings         = camp.Ratings.Count
            };
        }
        public async Task<IEnumerable<CampResponseDto>> GetAllCampsForAdminAsync()
        {
            var camps = await _campRepository.GetAllAsync();
            return camps.Select(c => MapToResponseDto(c)).ToList();
        }
    }
}