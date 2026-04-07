using CampSite.API.Models;

namespace CampSite.API.Repositories
{
    public interface IBookingRepository
    {
        Task<Booking?>              GetByReferenceNumberAsync(string referenceNumber);
        Task<Booking?>              GetByIdAsync(int id);
        Task<IEnumerable<Booking>>  GetAllAsync();
        Task<bool>                  HasOverlappingBookingAsync(
                                        int campId,
                                        DateTime checkIn,
                                        DateTime checkOut,
                                        int? excludeBookingId = null);
        Task<Booking>               CreateAsync(Booking booking);
        Task<Booking>               UpdateAsync(Booking booking);
        Task<bool>                  ExistsAsync(string referenceNumber);
    }
}