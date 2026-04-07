namespace CampSite.API.DTOs
{
    public class CouponResponseDto
    {
        public string? Code { get; set; }
        public decimal DiscountValue { get; set; }
        public int MinimumNights { get; set; }
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}