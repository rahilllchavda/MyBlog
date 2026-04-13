using CampSite.API.Data;
using CampSite.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Repositories
{
    public class CampRepository : ICampRepository
    {
        private readonly AppDbContext _context;

        public CampRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Camp>> GetAllAsync()
        {
            return await _context.Camps
                .Include(c => c.Ratings)
                .ToListAsync();
        }

        public async Task<Camp?> GetByIdAsync(int id)
        {
            return await _context.Camps
                .Include(c => c.Ratings)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Camp>> GetAvailableCampsAsync(
            DateTime checkIn,
            DateTime checkOut,
            int? capacity)
        {
            var query = _context.Camps
                .Include(c => c.Ratings)
                .Where(c => c.IsActive)
                .Where(c => !_context.Bookings.Any(b =>
                    b.CampId   == c.Id                  &&
                    b.Status   == BookingStatus.Active  &&
                    b.CheckIn  < checkOut               &&
                    b.CheckOut > checkIn));

            if (capacity.HasValue)
                query = query.Where(c => c.Capacity >= capacity.Value);

            return await query.ToListAsync();
        }

        public async Task<Camp> CreateAsync(Camp camp)
        {
            await _context.Camps.AddAsync(camp);
            await _context.SaveChangesAsync();
            return camp;
        }

        public async Task<Camp> UpdateAsync(Camp camp)
        {
            _context.Camps.Update(camp);
            await _context.SaveChangesAsync();
            return camp;
        }

        public async Task DeleteAsync(int id)
        {
            var camp = await _context.Camps.FindAsync(id);
            if (camp != null)
            {
                _context.Camps.Remove(camp);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Camps.AnyAsync(c => c.Id == id);
        }
    }
}