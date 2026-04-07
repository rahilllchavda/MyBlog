using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampSite.API.Models
{
    public enum BookingStatus
    {
        Active,
        Cancelled
    }

    public class Booking
    {
        public int Id { get; set; }

        [Required]
        [StringLength(8, MinimumLength = 8)]
        public string ReferenceNumber { get; set; } = string.Empty;

        [Required]
        public int CampId { get; set; }

        [ForeignKey("CampId")]
        public Camp Camp { get; set; } = null!;

        [Required]
        public string GuestFirstName { get; set; } = string.Empty;

        [Required]
        public string GuestLastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string GuestEmail { get; set; } = string.Empty;

        [Required]
        public string GuestPhone { get; set; } = string.Empty;

        [Required]
        public string BillingAddress { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string ZipCode { get; set; } = string.Empty;

        [Required]
        public string Country { get; set; } = string.Empty;

        [Required]
        public DateTime CheckIn { get; set; }

        [Required]
        public DateTime CheckOut { get; set; }

        public int NumberOfNights { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerNight { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string? CouponCode { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Rating? Rating { get; set; }
    }
}