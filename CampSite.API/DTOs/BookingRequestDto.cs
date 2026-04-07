namespace CampSite.API.DTOs
{
    public class BookingRequestDto
    {
        public int CampId { get; set; }
        public string GuestFirstName { get; set; } = string.Empty;
        public string GuestLastName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public string GuestPhone { get; set; } = string.Empty;
        public string BillingAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public string? CouponCode { get; set; }
    }
}