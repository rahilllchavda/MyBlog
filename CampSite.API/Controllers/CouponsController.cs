using CampSite.API.Data;
using CampSite.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CampSite.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CouponsController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/coupons
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _context.Coupons
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return Ok(coupons);
        }

        // POST api/coupons
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Coupon coupon)
        {
            var exists = await _context.Coupons
                .AnyAsync(c => c.Code == coupon.Code.ToUpper());

            if (exists)
                return BadRequest(new { message = "Coupon code already exists." });

            coupon.Code      = coupon.Code.ToUpper();
            coupon.IsActive  = true;
            coupon.CreatedAt = DateTime.UtcNow;

            await _context.Coupons.AddAsync(coupon);
            await _context.SaveChangesAsync();
            return Ok(coupon);
        }

        // PUT api/coupons/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Coupon updated)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                return NotFound(new { message = "Coupon not found." });

            coupon.IsActive      = updated.IsActive;
            coupon.DiscountValue = updated.DiscountValue;
            coupon.MinimumNights = updated.MinimumNights;

            await _context.SaveChangesAsync();
            return Ok(coupon);
        }

        // DELETE api/coupons/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                return NotFound(new { message = "Coupon not found." });

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Coupon deleted." });
        }
    }
}