using CampSite.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Camp>    Camps    { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Rating>  Ratings  { get; set; }
        public DbSet<Coupon>  Coupons  { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Camp → Bookings (one to many)
            modelBuilder.Entity<Camp>()
                .HasMany(c => c.Bookings)
                .WithOne(b => b.Camp)
                .HasForeignKey(b => b.CampId)
                .OnDelete(DeleteBehavior.Restrict);

            // Camp → Ratings (one to many)
            modelBuilder.Entity<Camp>()
                .HasMany(c => c.Ratings)
                .WithOne(r => r.Camp)
                .HasForeignKey(r => r.CampId)
                .OnDelete(DeleteBehavior.Restrict);

            // Booking → Rating (one to one)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Rating)
                .WithOne(r => r.Booking)
                .HasForeignKey<Rating>(r => r.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique reference number
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.ReferenceNumber)
                .IsUnique();

            // Unique coupon code
            modelBuilder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // Decimal precision
            modelBuilder.Entity<Camp>()
                .Property(c => c.PricePerNight)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Camp>()
                .Property(c => c.WeekendPricePerNight)
                .HasColumnType("decimal(18,2)");
        }
    }
}