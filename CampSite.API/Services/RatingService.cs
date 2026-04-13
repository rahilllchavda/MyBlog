using CampSite.API.Data;
using CampSite.API.DTOs;
using CampSite.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Services
{
    public class RatingService : IRatingService
    {
        private readonly AppDbContext _context;

        public RatingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RatingResponseDto> AddRatingAsync(RatingRequestDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Camp)
                .Include(b => b.Rating)
                .FirstOrDefaultAsync(b =>
                    b.ReferenceNumber == dto.ReferenceNumber &&
                    b.CampId          == dto.CampId);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found.");

            EnsureBookingOwner(booking, dto.GuestEmail);

            if (booking.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException(
                    "Cannot rate a cancelled booking.");

            if (booking.CheckOut > DateTime.Today)
                throw new InvalidOperationException(
                    "Rating can only be added after your stay is complete.");

            if (booking.Rating != null)
                throw new InvalidOperationException(
                    "Rating already exists. Use update instead.");

            if (dto.Stars < 1 || dto.Stars > 5)
                throw new InvalidOperationException(
                    "Stars must be between 1 and 5.");

            var rating = new Rating
            {
                BookingId = booking.Id,
                CampId    = dto.CampId,
                Stars     = dto.Stars,
                Comment   = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Ratings.AddAsync(rating);
            await _context.SaveChangesAsync();

            return MapToResponseDto(rating, booking.Camp?.Name ?? string.Empty);
        }

        public async Task<RatingResponseDto> UpdateRatingAsync(RatingRequestDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Camp)
                .Include(b => b.Rating)
                .FirstOrDefaultAsync(b =>
                    b.ReferenceNumber == dto.ReferenceNumber &&
                    b.CampId          == dto.CampId);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found.");

            EnsureBookingOwner(booking, dto.GuestEmail);

            if (booking.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException(
                    "Cannot update rating for a cancelled booking.");

            if (booking.Rating == null)
                throw new KeyNotFoundException(
                    "No rating found. Please add a rating first.");

            if (dto.Stars < 1 || dto.Stars > 5)
                throw new InvalidOperationException(
                    "Stars must be between 1 and 5.");

            booking.Rating.Stars     = dto.Stars;
            booking.Rating.Comment   = dto.Comment;
            booking.Rating.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponseDto(
                booking.Rating,
                booking.Camp?.Name ?? string.Empty);
        }

        private static RatingResponseDto MapToResponseDto(
            Rating rating, string campName)
        {
            return new RatingResponseDto
            {
                Id        = rating.Id,
                CampId    = rating.CampId,
                CampName  = campName,
                Stars     = rating.Stars,
                Comment   = rating.Comment,
                CreatedAt = rating.CreatedAt,
                UpdatedAt = rating.UpdatedAt
            };
        }

        private static void EnsureBookingOwner(Booking booking, string guestEmail)
        {
            if (string.IsNullOrWhiteSpace(guestEmail))
                throw new UnauthorizedAccessException("Guest email is required.");

            if (!string.Equals(
                    booking.GuestEmail.Trim(),
                    guestEmail.Trim(),
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Guest email does not match this booking.");
            }
        }
    }
}