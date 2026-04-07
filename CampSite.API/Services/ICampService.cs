using CampSite.API.DTOs;

namespace CampSite.API.Services
{
    public interface ICampService
    {
        Task<PagedCampResponseDto> GetAvailableCampsAsync(CampSearchDto searchDto);
        Task<CampResponseDto?>     GetByIdAsync(int id);
        Task<CampResponseDto>      CreateAsync(CampCreateDto dto);
        Task<CampResponseDto>      UpdateAsync(int id, CampUpdateDto dto);
        Task                       DeleteAsync(int id);
        Task<IEnumerable<CampResponseDto>> GetAllCampsForAdminAsync();
    }
}