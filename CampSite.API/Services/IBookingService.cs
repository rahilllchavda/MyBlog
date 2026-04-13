using CampSite.API.DTOs;

namespace CampSite.API.Services
{
    public interface IBookingService
    {
        Task<BookingResponseDto>  CreateBookingAsync(BookingRequestDto dto);
        Task<BookingResponseDto?> GetByReferenceNumberAsync(
            string referenceNumber,
            string? guestEmail = null);
        Task<BookingResponseDto?> GetByGuestEmailAsync(string guestEmail);
        Task<BookingResponseDto>  CancelBookingAsync(
            string referenceNumber,
            string guestEmail);
        Task<CouponResponseDto>   ValidateCouponAsync(CouponValidateDto dto);
    }
}