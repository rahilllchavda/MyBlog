using CampSite.API.DTOs;
using CampSite.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CampSite.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // POST api/bookings
        [HttpPost]
        public async Task<IActionResult> CreateBooking(
            [FromBody] BookingRequestDto dto)
        {
            var booking = await _bookingService.CreateBookingAsync(dto);
            return CreatedAtAction(
                nameof(GetByReference),
                new { referenceNumber = booking.ReferenceNumber },
                booking);
        }

        // GET api/bookings/{referenceNumber}
        [HttpGet("{referenceNumber}")]
        public async Task<IActionResult> GetByReference(string referenceNumber)
        {
            var booking = await _bookingService
                .GetByReferenceNumberAsync(referenceNumber);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            return Ok(booking);
        }

        // PUT api/bookings/{referenceNumber}/cancel
        [HttpPut("{referenceNumber}/cancel")]
        public async Task<IActionResult> CancelBooking(string referenceNumber)
        {
            var booking = await _bookingService
                .CancelBookingAsync(referenceNumber);
            return Ok(booking);
        }

        // POST api/bookings/validate-coupon
        [HttpPost("validate-coupon")]
        public async Task<IActionResult> ValidateCoupon(
            [FromBody] CouponValidateDto dto)
        {
            var result = await _bookingService.ValidateCouponAsync(dto);
            return Ok(result);
        }
    }
}