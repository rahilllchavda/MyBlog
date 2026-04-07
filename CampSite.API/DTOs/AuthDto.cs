namespace CampSite.API.DTOs
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequestDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        // ✅ VERY IMPORTANT
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;

        // ✅ Auth Data
        public string Token { get; set; } = string.Empty;

        // ✅ User Info
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }

        // ✅ Token Expiry
        public DateTime ExpiresAt { get; set; }
    }
}