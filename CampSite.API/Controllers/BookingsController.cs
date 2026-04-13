using CampSite.API.DTOs;
using CampSite.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

    // POST api/bookings — anyone can book
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateBooking(
        [FromBody] BookingRequestDto dto)
    {
        var booking = await _bookingService.CreateBookingAsync(dto);
        return CreatedAtAction(
            nameof(GetBooking),
            new { referenceNumber = booking.ReferenceNumber },
            booking);
    }

    // GET api/bookings/{referenceNumber} — anyone with ref can view
    // Query param ?guestEmail=X is optional for email-only search
    [HttpGet("{referenceNumber?}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBooking(
        string? referenceNumber,
        [FromQuery] string? guestEmail)
    {
        // ✅ Search by email only (no reference number)
        if (string.IsNullOrWhiteSpace(referenceNumber))
        {
            if (string.IsNullOrWhiteSpace(guestEmail))
                return BadRequest(new { message = "Please provide an email address." });

            var booking = await _bookingService.GetByGuestEmailAsync(guestEmail);
            if (booking == null)
                return NotFound(new { message = "No bookings found with this email address." });

            return Ok(booking);
        }

        var bookingByRef = await _bookingService
            .GetByReferenceNumberAsync(referenceNumber, guestEmail);

        if (bookingByRef == null)
            return NotFound(new { message = "Booking not found." });

        return Ok(bookingByRef);
    }

    // GET api/bookings/by-reference/{referenceNumber} — direct reference lookup
    [HttpGet("by-reference/{referenceNumber}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByReferenceOnly(string referenceNumber)
    {
        var booking = await _bookingService.GetByReferenceNumberAsync(referenceNumber);

        if (booking == null)
            return NotFound(new { message = "Booking not found." });

        return Ok(booking);
    }

    // PUT api/bookings/{referenceNumber}/cancel — anyone with ref can cancel
    [HttpPut("{referenceNumber}/cancel")]
    [AllowAnonymous]
    public async Task<IActionResult> CancelBooking(
        string referenceNumber,
        [FromBody] CancelBookingRequestDto dto)
    {
        var booking = await _bookingService
            .CancelBookingAsync(referenceNumber, dto.GuestEmail);
        return Ok(booking);
    }

    // POST api/bookings/validate-coupon
    [HttpPost("validate-coupon")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateCoupon(
        [FromBody] CouponValidateDto dto)
    {
        var result = await _bookingService.ValidateCouponAsync(dto);
        return Ok(result);
    }
}
}