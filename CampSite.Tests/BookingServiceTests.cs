using CampSite.API.Data;
using CampSite.API.DTOs;
using CampSite.API.Models;
using CampSite.API.Repositories;
using CampSite.API.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace CampSite.Tests
{
    public class BookingServiceTests
    {
        private readonly Mock<IBookingRepository> _mockBookingRepo;
        private readonly Mock<ICampRepository>    _mockCampRepo;
        private readonly AppDbContext             _context;
        private readonly BookingService           _bookingService;

        public BookingServiceTests()
        {
            _mockBookingRepo = new Mock<IBookingRepository>();
            _mockCampRepo    = new Mock<ICampRepository>();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(
                    databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            _bookingService = new BookingService(
                _mockBookingRepo.Object,
                _mockCampRepo.Object,
                _context);
        }

        [Fact]
        public async Task CreateBookingAsync_ShouldThrow_WhenCampNotFound()
        {
            // Arrange
            _mockCampRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Camp?)null);

            var dto = new BookingRequestDto
            {
                CampId   = 999,
                CheckIn  = DateTime.Today.AddDays(1),
                CheckOut = DateTime.Today.AddDays(3)
            };

            // Act
            var act = async () => await _bookingService.CreateBookingAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Camp not found.");
        }

        [Fact]
        public async Task CreateBookingAsync_ShouldThrow_WhenDatesOverlap()
        {
            // Arrange
            var camp = new Camp
            {
                Id            = 1,
                Name          = "Test Camp",
                Description   = "Test",
                Location      = "Test",
                ImageUrl      = "https://example.com/img.jpg",
                Capacity      = 4,
                PricePerNight = 100,
                IsActive      = true,
                Ratings       = new List<Rating>()
            };

            _mockCampRepo
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(camp);

            _mockBookingRepo
                .Setup(r => r.HasOverlappingBookingAsync(
                    1,
                    It.IsAny<DateTime>(),
                    It.IsAny<DateTime>(),
                    null))
                .ReturnsAsync(true);

            var dto = new BookingRequestDto
            {
                CampId         = 1,
                CheckIn        = DateTime.Today.AddDays(1),
                CheckOut       = DateTime.Today.AddDays(3),
                GuestFirstName = "John",
                GuestLastName  = "Doe",
                GuestEmail     = "john@test.com",
                GuestPhone     = "1234567890",
                BillingAddress = "123 Main St",
                City           = "NYC",
                ZipCode        = "10001",
                Country        = "US"
            };

            // Act
            var act = async () => await _bookingService.CreateBookingAsync(dto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*already booked*");
        }

        [Fact]
        public async Task CreateBookingAsync_ShouldThrow_WhenCheckInIsInPast()
        {
            // Arrange
            var camp = new Camp
            {
                Id            = 1,
                Name          = "Test Camp",
                Description   = "Test",
                Location      = "Test",
                ImageUrl      = "https://example.com/img.jpg",
                Capacity      = 4,
                PricePerNight = 100,
                IsActive      = true,
                Ratings       = new List<Rating>()
            };

            _mockCampRepo
                .Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(camp);

            var dto = new BookingRequestDto
            {
                CampId   = 1,
                CheckIn  = DateTime.Today.AddDays(-1), // Past date
                CheckOut = DateTime.Today.AddDays(1)
            };

            // Act
            var act = async () => await _bookingService.CreateBookingAsync(dto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*past*");
        }

        [Fact]
        public async Task CancelBookingAsync_ShouldThrow_WhenBookingNotFound()
        {
            // Arrange
            _mockBookingRepo
                .Setup(r => r.GetByReferenceNumberAsync(It.IsAny<string>()))
                .ReturnsAsync((Booking?)null);

            // Act
            var act = async () =>
                await _bookingService.CancelBookingAsync(
                    "INVALID1",
                    "guest@example.com");

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Booking not found.");
        }

        [Fact]
        public async Task CancelBookingAsync_ShouldThrow_WhenBookingAlreadyStarted()
        {
            // Arrange
            var booking = new Booking
            {
                Id              = 1,
                ReferenceNumber = "ABCD1234",
                CampId          = 1,
                GuestEmail      = "guest@example.com",
                CheckIn         = DateTime.Today.AddDays(-1), // Already started
                CheckOut        = DateTime.Today.AddDays(2),
                Status          = BookingStatus.Active,
                Camp            = new Camp
                {
                    Name     = "Test Camp",
                    Location = "Test",
                    ImageUrl = "https://example.com/img.jpg"
                }
            };

            _mockBookingRepo
                .Setup(r => r.GetByReferenceNumberAsync("ABCD1234"))
                .ReturnsAsync(booking);

            // Act
            var act = async () =>
                await _bookingService.CancelBookingAsync(
                    "ABCD1234",
                    "guest@example.com");

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*already started*");
        }

        [Fact]
        public async Task ValidateCouponAsync_ShouldReturnInvalid_WhenCouponNotFound()
        {
            // Act
            var result = await _bookingService.ValidateCouponAsync(
                new CouponValidateDto
                {
                    CouponCode     = "INVALID",
                    NumberOfNights = 2
                });

            // Assert
            result.IsValid.Should().BeFalse();
            result.Message.Should().Contain("Invalid");
        }

        [Fact]
        public async Task ValidateCouponAsync_ShouldReturnValid_WhenCouponExists()
        {
            // Arrange — seed coupon into in-memory DB
            await _context.Coupons.AddAsync(new Coupon
            {
                Code          = "CAMP10",
                DiscountValue = 10,
                MinimumNights = 1,
                IsActive      = true
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _bookingService.ValidateCouponAsync(
                new CouponValidateDto
                {
                    CouponCode     = "CAMP10",
                    NumberOfNights = 2
                });

            // Assert
            result.IsValid.Should().BeTrue();
            result.DiscountValue.Should().Be(10);
        }
    }
}