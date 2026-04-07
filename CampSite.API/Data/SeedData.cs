using CampSite.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(
            AppDbContext                  context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole>    roleManager)
        {
            await context.Database.MigrateAsync();

            // Roles
            foreach (var role in new[] { "Admin", "User" })
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));

            // Admin user
            if (await userManager.FindByEmailAsync("admin@campsite.com") == null)
            {
                var admin = new ApplicationUser
                {
                    UserName       = "admin@campsite.com",
                    Email          = "admin@campsite.com",
                    FirstName      = "Camp",
                    LastName       = "Admin",
                    IsAdmin        = true,
                    EmailConfirmed = true
                };
                var r = await userManager.CreateAsync(admin, "Admin@123");
                if (r.Succeeded)
                    await userManager.AddToRoleAsync(admin, "Admin");
            }

            // Demo user
            if (await userManager.FindByEmailAsync("user@campsite.com") == null)
            {
                var user = new ApplicationUser
                {
                    UserName       = "user@campsite.com",
                    Email          = "user@campsite.com",
                    FirstName      = "John",
                    LastName       = "Camper",
                    IsAdmin        = false,
                    EmailConfirmed = true
                };
                var r = await userManager.CreateAsync(user, "User@123");
                if (r.Succeeded)
                    await userManager.AddToRoleAsync(user, "User");
            }

            // Camps
            if (!await context.Camps.AnyAsync())
            {
                var camps = new List<Camp>
                {
                    new Camp
                    {
                        Name                 = "Pinewood Haven",
                        Description          = "Nestled among ancient pines with breathtaking mountain views.",
                        Location             = "Blue Ridge Mountains, NC",
                        ImageUrl             = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
                        Capacity             = 4,
                        PricePerNight        = 85.00m,
                        WeekendPricePerNight = 110.00m,
                        IsActive             = true,
                        CreatedAt            = DateTime.UtcNow
                    },
                    new Camp
                    {
                        Name                 = "Riverside Retreat",
                        Description          = "Wake up to the sound of rushing water by the crystal-clear river.",
                        Location             = "Smoky Mountains, TN",
                        ImageUrl             = "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800",
                        Capacity             = 2,
                        PricePerNight        = 65.00m,
                        WeekendPricePerNight = 85.00m,
                        IsActive             = true,
                        CreatedAt            = DateTime.UtcNow
                    },
                    new Camp
                    {
                        Name                 = "Summit Camp",
                        Description          = "Breathtaking 360-degree panoramic views above the clouds.",
                        Location             = "Rocky Mountains, CO",
                        ImageUrl             = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
                        Capacity             = 8,
                        PricePerNight        = 120.00m,
                        WeekendPricePerNight = 150.00m,
                        IsActive             = true,
                        CreatedAt            = DateTime.UtcNow
                    },
                    new Camp
                    {
                        Name                 = "Meadow Bliss",
                        Description          = "Open meadow camping with wildflowers, ideal for stargazing.",
                        Location             = "Yellowstone, WY",
                        ImageUrl             = "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800",
                        Capacity             = 6,
                        PricePerNight        = 95.00m,
                        WeekendPricePerNight = 120.00m,
                        IsActive             = true,
                        CreatedAt            = DateTime.UtcNow
                    },
                    new Camp
                    {
                        Name                 = "Forest Hollow",
                        Description          = "Hidden gem deep in old-growth forest, completely off-grid.",
                        Location             = "Olympic National Park, WA",
                        ImageUrl             = "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800",
                        Capacity             = 1,
                        PricePerNight        = 45.00m,
                        WeekendPricePerNight = 60.00m,
                        IsActive             = true,
                        CreatedAt            = DateTime.UtcNow
                    },
                    new Camp
                    {
                        Name                 = "Lakeview Lodge Camp",
                        Description          = "Camp at the edge of a scenic lake with fishing and kayaking.",
                        Location             = "Lake Tahoe, CA",
                        ImageUrl             = "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800",
                        Capacity             = 4,
                        PricePerNight        = 110.00m,
                        WeekendPricePerNight = 140.00m,
                        IsActive             = true,
                        CreatedAt            = DateTime.UtcNow
                    }
                };
                await context.Camps.AddRangeAsync(camps);
            }

            // Coupons
            if (!await context.Coupons.AnyAsync())
            {
                await context.Coupons.AddRangeAsync(new List<Coupon>
                {
                    new Coupon
                    {
                        Code          = "CAMP10",
                        DiscountValue = 10.00m,
                        MinimumNights = 1,
                        IsActive      = true,
                        CreatedAt     = DateTime.UtcNow
                    },
                    new Coupon
                    {
                        Code          = "CAMP25",
                        DiscountValue = 25.00m,
                        MinimumNights = 2,
                        IsActive      = true,
                        CreatedAt     = DateTime.UtcNow
                    },
                    new Coupon
                    {
                        Code          = "SUMMER50",
                        DiscountValue = 50.00m,
                        MinimumNights = 3,
                        IsActive      = true,
                        CreatedAt     = DateTime.UtcNow
                    }
                });
            }

            await context.SaveChangesAsync();
        }
    }
}