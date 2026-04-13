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

            // ✅ Admin user (ensure IsAdmin = true ONLY for this email)
            var adminUser = await userManager.FindByEmailAsync("admin@campsite.com");
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName       = "admin@campsite.com",
                    Email          = "admin@campsite.com",
                    FirstName      = "Camp",
                    LastName       = "Admin",
                    IsAdmin        = true,
                    EmailConfirmed = true
                };
                var r = await userManager.CreateAsync(adminUser, "Admin@123");
                if (r.Succeeded)
                    await userManager.AddToRoleAsync(adminUser, "Admin");
            }
            else
            {
                // Ensure admin user always has IsAdmin = true and Admin role
                adminUser.IsAdmin = true;
                await userManager.UpdateAsync(adminUser);
                var adminRoles = await userManager.GetRolesAsync(adminUser);
                if (!adminRoles.Contains("Admin"))
                    await userManager.AddToRoleAsync(adminUser, "Admin");
            }

            // ✅ Demo user (ensure IsAdmin = false for regular users)
            var demoUser = await userManager.FindByEmailAsync("user@campsite.com");
            if (demoUser == null)
            {
                demoUser = new ApplicationUser
                {
                    UserName       = "user@campsite.com",
                    Email          = "user@campsite.com",
                    FirstName      = "John",
                    LastName       = "Camper",
                    IsAdmin        = false,
                    EmailConfirmed = true
                };
                var r = await userManager.CreateAsync(demoUser, "User@123");
                if (r.Succeeded)
                    await userManager.AddToRoleAsync(demoUser, "User");
            }
            else
            {
                // Ensure demo user always has IsAdmin = false
                demoUser.IsAdmin = false;
                await userManager.UpdateAsync(demoUser);
                var userRoles = await userManager.GetRolesAsync(demoUser);
                if (!userRoles.Contains("User"))
                    await userManager.AddToRoleAsync(demoUser, "User");
            }

            // Camps (idempotent: add only missing names)
            var now = DateTime.UtcNow;
            var seedCamps = new List<Camp>
            {
                new Camp
                {
                    Name                 = "Pinecrest Ridge",
                    Description          = "A peaceful hillside camp with sunrise views, pine trails, and quiet nights by the fire.",
                    Location             = "Blue Ridge Mountains, NC",
                    ImageUrl             = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200",
                    Capacity             = 4,
                    PricePerNight        = 95.00m,
                    WeekendPricePerNight = 125.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Riverstone Bend",
                    Description          = "Set beside a clear mountain river, perfect for kayaking, fishing, and shaded picnic mornings.",
                    Location             = "Smoky Mountains, TN",
                    ImageUrl             = "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=1200",
                    Capacity             = 3,
                    PricePerNight        = 82.00m,
                    WeekendPricePerNight = 104.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Cloudline Summit",
                    Description          = "High-elevation basecamp with 360° views, crisp alpine air, and spectacular stargazing.",
                    Location             = "Rocky Mountains, CO",
                    ImageUrl             = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
                    Capacity             = 8,
                    PricePerNight        = 155.00m,
                    WeekendPricePerNight = 199.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Wildflower Meadow",
                    Description          = "Open meadow camping surrounded by seasonal blooms with wide skies and sunset photography spots.",
                    Location             = "Yellowstone, WY",
                    ImageUrl             = "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=1200",
                    Capacity             = 6,
                    PricePerNight        = 118.00m,
                    WeekendPricePerNight = 146.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Timber Hollow",
                    Description          = "A secluded forest escape for solo travelers and couples who want true off-grid calm.",
                    Location             = "Olympic National Park, WA",
                    ImageUrl             = "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200",
                    Capacity             = 2,
                    PricePerNight        = 78.00m,
                    WeekendPricePerNight = 96.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Lakeside Lantern Camp",
                    Description          = "Waterfront pitches with dock access, canoe rentals, and glowing evenings by the lake.",
                    Location             = "Lake Tahoe, CA",
                    ImageUrl             = "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=1200",
                    Capacity             = 5,
                    PricePerNight        = 142.00m,
                    WeekendPricePerNight = 179.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Red Canyon Outpost",
                    Description          = "Desert-edge campsite with dramatic red cliffs, sunrise hikes, and crisp dry-air nights.",
                    Location             = "Moab, UT",
                    ImageUrl             = "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200",
                    Capacity             = 4,
                    PricePerNight        = 112.00m,
                    WeekendPricePerNight = 138.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Cedar Grove Camp",
                    Description          = "Family-friendly cedar grove with level tent pads, easy trails, and nearby waterfall walks.",
                    Location             = "Bend, OR",
                    ImageUrl             = "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200",
                    Capacity             = 6,
                    PricePerNight        = 105.00m,
                    WeekendPricePerNight = 132.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Granite Peak Basecamp",
                    Description          = "Adventure basecamp close to climbing routes and mountain bike loops.",
                    Location             = "Sierra Nevada, CA",
                    ImageUrl             = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
                    Capacity             = 7,
                    PricePerNight        = 149.00m,
                    WeekendPricePerNight = 188.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Silver Pine Retreat",
                    Description          = "Quiet woodland retreat with hammocking zones and lantern-lit walking paths.",
                    Location             = "Adirondacks, NY",
                    ImageUrl             = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200",
                    Capacity             = 4,
                    PricePerNight        = 109.00m,
                    WeekendPricePerNight = 136.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Whispering Dunes Camp",
                    Description          = "Coastal dune camping with ocean breeze, boardwalk access, and golden-hour views.",
                    Location             = "Outer Banks, NC",
                    ImageUrl             = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200",
                    Capacity             = 5,
                    PricePerNight        = 126.00m,
                    WeekendPricePerNight = 158.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Maple Creek Grounds",
                    Description          = "Creekside camp among maples with easy access to gentle family hiking loops.",
                    Location             = "White Mountains, NH",
                    ImageUrl             = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200",
                    Capacity             = 6,
                    PricePerNight        = 101.00m,
                    WeekendPricePerNight = 128.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Aurora Valley Camp",
                    Description          = "Wide valley views, cold-clear nights, and ideal conditions for astrophotography.",
                    Location             = "Glacier Gateway, MT",
                    ImageUrl             = "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200",
                    Capacity             = 3,
                    PricePerNight        = 132.00m,
                    WeekendPricePerNight = 165.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Eagle Pass Camp",
                    Description          = "Ridgeline camp with expansive overlooks and nearby guided trekking routes.",
                    Location             = "Grand Teton Region, WY",
                    ImageUrl             = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
                    Capacity             = 8,
                    PricePerNight        = 168.00m,
                    WeekendPricePerNight = 212.00m,
                    IsActive             = true,
                    CreatedAt            = now
                },
                new Camp
                {
                    Name                 = "Juniper Flats",
                    Description          = "Open high-desert camping with spectacular sunrise skies and quiet evening winds.",
                    Location             = "Sedona, AZ",
                    ImageUrl             = "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200",
                    Capacity             = 4,
                    PricePerNight        = 116.00m,
                    WeekendPricePerNight = 144.00m,
                    IsActive             = true,
                    CreatedAt            = now
                }
            };

            var existingCampNames = await context.Camps
                .Select(c => c.Name)
                .ToListAsync();

            var campsToAdd = seedCamps
                .Where(c => !existingCampNames.Contains(c.Name))
                .ToList();

            if (campsToAdd.Count > 0)
                await context.Camps.AddRangeAsync(campsToAdd);

            // Coupons (idempotent: add only missing codes)
            var seedCoupons = new List<Coupon>
            {
                new Coupon
                {
                    Code          = "CAMP10",
                    DiscountValue = 10.00m,
                    MinimumNights = 1,
                    IsActive      = true,
                    CreatedAt     = now
                },
                new Coupon
                {
                    Code          = "WEEKEND20",
                    DiscountValue = 20.00m,
                    MinimumNights = 2,
                    IsActive      = true,
                    CreatedAt     = now
                },
                new Coupon
                {
                    Code          = "ADVENTURE35",
                    DiscountValue = 35.00m,
                    MinimumNights = 3,
                    IsActive      = true,
                    CreatedAt     = now
                },
                new Coupon
                {
                    Code          = "FAMILY50",
                    DiscountValue = 50.00m,
                    MinimumNights = 4,
                    IsActive      = true,
                    CreatedAt     = now
                },
                new Coupon
                {
                    Code          = "LONGSTAY80",
                    DiscountValue = 80.00m,
                    MinimumNights = 6,
                    IsActive      = true,
                    CreatedAt     = now
                }
            };

            var existingCouponCodes = await context.Coupons
                .Select(c => c.Code)
                .ToListAsync();

            var couponsToAdd = seedCoupons
                .Where(c => !existingCouponCodes.Contains(c.Code))
                .ToList();

            if (couponsToAdd.Count > 0)
                await context.Coupons.AddRangeAsync(couponsToAdd);

            await context.SaveChangesAsync();
        }
    }
}