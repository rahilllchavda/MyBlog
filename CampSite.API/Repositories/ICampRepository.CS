using CampSite.API.Models;

namespace CampSite.API.Repositories
{
    public interface ICampRepository
    {
        Task<IEnumerable<Camp>> GetAllAsync();
        Task<Camp?> GetByIdAsync(int id);
        Task<IEnumerable<Camp>> GetAvailableCampsAsync(
            DateTime checkIn,
            DateTime checkOut,
            int? capacity);
        Task<Camp> CreateAsync(Camp camp);
        Task<Camp> UpdateAsync(Camp camp);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}