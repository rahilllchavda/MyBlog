namespace CampSite.API.DTOs
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public int CampId { get; set; }
        public string CampName { get; set; } = string.Empty;
        public string CampLocation { get; set; } = string.Empty;
        public string CampImageUrl { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int NumberOfNights { get; set; }
        public decimal PricePerNight { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CouponCode { get; set; }
        public string GuestFirstName { get; set; } = string.Empty;
        public string GuestLastName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public string GuestPhone { get; set; } = string.Empty;
        public string BillingAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? RatingStars { get; set; }
    }
}