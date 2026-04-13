using CampSite.API.Data;
using CampSite.API.DTOs;
using CampSite.API.Models;
using CampSite.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ICampRepository    _campRepository;
        private readonly AppDbContext       _context;

        public BookingService(
            IBookingRepository bookingRepository,
            ICampRepository    campRepository,
            AppDbContext       context)
        {
            _bookingRepository = bookingRepository;
            _campRepository    = campRepository;
            _context           = context;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(BookingRequestDto dto)
        {
            var camp = await _campRepository.GetByIdAsync(dto.CampId);
            if (camp == null)
                throw new KeyNotFoundException("Camp not found.");

            if (dto.CheckIn >= dto.CheckOut)
                throw new InvalidOperationException(
                    "Check-out must be after check-in.");

            if (dto.CheckIn < DateTime.Today)
                throw new InvalidOperationException(
                    "Check-in date cannot be in the past.");

            var hasOverlap = await _bookingRepository.HasOverlappingBookingAsync(
                dto.CampId, dto.CheckIn, dto.CheckOut);

            if (hasOverlap)
                throw new InvalidOperationException(
                    "This camp is already booked for the selected dates.");

            var nights   = (dto.CheckOut - dto.CheckIn).Days;
            var subTotal = CampService.CalculateTotalPrice(
                camp, dto.CheckIn, dto.CheckOut);

            decimal discount = 0;
            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                var coupon = await _context.Coupons
                    .FirstOrDefaultAsync(c =>
                        c.Code     == dto.CouponCode.ToUpper() &&
                        c.IsActive == true);

                if (coupon != null && nights >= coupon.MinimumNights)
                    discount = Math.Min(coupon.DiscountValue, subTotal);
            }

            var booking = new Booking
            {
                ReferenceNumber = await GenerateUniqueReferenceNumberAsync(),
                CampId          = dto.CampId,
                GuestFirstName  = dto.GuestFirstName,
                GuestLastName   = dto.GuestLastName,
                GuestEmail      = dto.GuestEmail,
                GuestPhone      = dto.GuestPhone,
                BillingAddress  = dto.BillingAddress,
                City            = dto.City,
                ZipCode         = dto.ZipCode,
                Country         = dto.Country,
                CheckIn         = dto.CheckIn,
                CheckOut        = dto.CheckOut,
                NumberOfNights  = nights,
                PricePerNight   = camp.PricePerNight,
                SubTotal        = subTotal,
                Discount        = discount,
                TotalAmount     = subTotal - discount,
                CouponCode      = dto.CouponCode?.ToUpper(),
                Status          = BookingStatus.Active,
                CreatedAt       = DateTime.UtcNow
            };

            var created = await _bookingRepository.CreateAsync(booking);
            return MapToResponseDto(created);
        }

        public async Task<BookingResponseDto?> GetByReferenceNumberAsync(
            string referenceNumber,
            string? guestEmail = null)
        {
            var booking = await _bookingRepository
                .GetByReferenceNumberAsync(referenceNumber);

            if (booking == null)
                return null;

            if (!string.IsNullOrWhiteSpace(guestEmail))
                EnsureBookingOwner(booking, guestEmail);

            return MapToResponseDto(booking);
        }

        // ✅ Get booking by email only (returns first active booking)
        public async Task<BookingResponseDto?> GetByGuestEmailAsync(string guestEmail)
        {
            if (string.IsNullOrWhiteSpace(guestEmail))
                throw new ArgumentException("Guest email is required.", nameof(guestEmail));

            var booking = await _bookingRepository
                .GetByEmailAsync(guestEmail.ToLower().Trim());

            if (booking == null)
                return null;

            return MapToResponseDto(booking);
        }

        public async Task<BookingResponseDto> CancelBookingAsync(
            string referenceNumber,
            string guestEmail)
        {
            var booking = await _bookingRepository
                .GetByReferenceNumberAsync(referenceNumber);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found.");

            EnsureBookingOwner(booking, guestEmail);

            if (booking.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException(
                    "Booking is already cancelled.");

            if (booking.CheckIn <= DateTime.Today)
                throw new InvalidOperationException(
                    "Cannot cancel a booking that has already started or passed.");

            booking.Status = BookingStatus.Cancelled;
            var updated    = await _bookingRepository.UpdateAsync(booking);
            return MapToResponseDto(updated);
        }

        public async Task<CouponResponseDto> ValidateCouponAsync(
            CouponValidateDto dto)
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c =>
                    c.Code     == dto.CouponCode.ToUpper() &&
                    c.IsActive == true);

            if (coupon == null)
                return new CouponResponseDto
                {
                    IsValid = false,
                    Message = "Invalid or expired coupon code."
                };

            if (dto.NumberOfNights < coupon.MinimumNights)
                return new CouponResponseDto
                {
                    IsValid = false,
                    Message = $"This coupon requires minimum " +
                              $"{coupon.MinimumNights} night(s)."
                };

            return new CouponResponseDto
            {
                Code          = coupon.Code,
                DiscountValue = coupon.DiscountValue,
                MinimumNights = coupon.MinimumNights,
                IsValid       = true,
                Message       = $"Coupon applied! You save ${coupon.DiscountValue}"
            };
        }

        // ── Helpers ───────────────────────────────────────────
        private async Task<string> GenerateUniqueReferenceNumberAsync()
        {
            for (var attempt = 0; attempt < 10; attempt++)
            {
                var candidate = GenerateReferenceNumber();
                if (!await _bookingRepository.ExistsAsync(candidate))
                    return candidate;
            }

            throw new InvalidOperationException(
                "Unable to generate a unique booking reference. Please try again.");
        }

        private static string GenerateReferenceNumber()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random         = new Random();
            return new string(
                Enumerable.Repeat(chars, 8)
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
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

        private static BookingResponseDto MapToResponseDto(Booking booking)
        {
            return new BookingResponseDto
            {
                Id              = booking.Id,
                ReferenceNumber = booking.ReferenceNumber,
                CampId          = booking.CampId,
                CampName        = booking.Camp?.Name        ?? string.Empty,
                CampLocation    = booking.Camp?.Location    ?? string.Empty,
                CampImageUrl    = booking.Camp?.ImageUrl    ?? string.Empty,
                CheckIn         = booking.CheckIn,
                CheckOut        = booking.CheckOut,
                NumberOfNights  = booking.NumberOfNights,
                PricePerNight   = booking.PricePerNight,
                SubTotal        = booking.SubTotal,
                Discount        = booking.Discount,
                TotalAmount     = booking.TotalAmount,
                CouponCode      = booking.CouponCode,
                GuestFirstName  = booking.GuestFirstName,
                GuestLastName   = booking.GuestLastName,
                GuestEmail      = booking.GuestEmail,
                GuestPhone      = booking.GuestPhone,
                BillingAddress  = booking.BillingAddress,
                City            = booking.City,
                ZipCode         = booking.ZipCode,
                Country         = booking.Country,
                Status          = booking.Status.ToString(),
                CreatedAt       = booking.CreatedAt,
                RatingStars     = booking.Rating?.Stars
            };
        }
    }
}