using CampSite.API.Data;
using CampSite.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;

        public BookingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByReferenceNumberAsync(string referenceNumber)
        {
            var normalizedReference = referenceNumber.Trim().ToUpper();

            return await _context.Bookings
                .Include(b => b.Camp)
                .Include(b => b.Rating)
                .FirstOrDefaultAsync(b =>
                    b.ReferenceNumber.ToUpper() == normalizedReference);
        }

        // ✅ Get first active booking by email
        public async Task<Booking?> GetByEmailAsync(string guestEmail)
        {
            var today = DateTime.Today;

            return await _context.Bookings
                .Include(b => b.Camp)
                .Include(b => b.Rating)
                .Where(b => b.Status == BookingStatus.Active)
                .OrderByDescending(b => b.CheckOut <= today)
                .ThenByDescending(b => b.CheckOut)
                .FirstOrDefaultAsync(b =>
                    b.GuestEmail.ToLower() == guestEmail.ToLower());
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Camp)
                .Include(b => b.Rating)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Camp)
                .Include(b => b.Rating)
                .ToListAsync();
        }

        public async Task<bool> HasOverlappingBookingAsync(
            int campId,
            DateTime checkIn,
            DateTime checkOut,
            int? excludeBookingId = null)
        {
            var query = _context.Bookings
                .Where(b =>
                    b.CampId   == campId             &&
                    b.Status   == BookingStatus.Active &&
                    b.CheckIn  < checkOut             &&
                    b.CheckOut > checkIn);

            if (excludeBookingId.HasValue)
                query = query.Where(b => b.Id != excludeBookingId.Value);

            return await query.AnyAsync();
        }

        public async Task<Booking> CreateAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking> UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> ExistsAsync(string referenceNumber)
        {
            return await _context.Bookings
                .AnyAsync(b => b.ReferenceNumber == referenceNumber);
        }
    }
}

//