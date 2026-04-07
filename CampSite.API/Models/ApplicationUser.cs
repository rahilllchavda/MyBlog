using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CampSite.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        // Required as per assignment
        public bool IsAdmin { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ Navigation Properties (VERY IMPORTANT)
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    }
}