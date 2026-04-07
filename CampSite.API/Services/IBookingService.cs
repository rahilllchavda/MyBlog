using CampSite.API.DTOs;

namespace CampSite.API.Services
{
    public interface IBookingService
    {
        Task<BookingResponseDto>  CreateBookingAsync(BookingRequestDto dto);
        Task<BookingResponseDto?> GetByReferenceNumberAsync(string referenceNumber);
        Task<BookingResponseDto>  CancelBookingAsync(string referenceNumber);
        Task<CouponResponseDto>   ValidateCouponAsync(CouponValidateDto dto);
    }
}