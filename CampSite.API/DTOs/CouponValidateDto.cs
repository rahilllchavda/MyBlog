namespace CampSite.API.DTOs
{
    public class CouponValidateDto
    {
        public string CouponCode { get; set; } = string.Empty;
        public int NumberOfNights { get; set; }
    }
}