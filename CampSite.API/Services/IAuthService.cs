using CampSite.API.DTOs;

namespace CampSite.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
    }
}