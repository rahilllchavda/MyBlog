using CampSite.API.DTOs;
using CampSite.API.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

namespace CampSite.Tests
{
    public class ValidationTests
    {
        private readonly BookingRequestValidator _bookingValidator;
        private readonly CampCreateValidator     _campCreateValidator;

        public ValidationTests()
        {
            _bookingValidator    = new BookingRequestValidator();
            _campCreateValidator = new CampCreateValidator();
        }

        [Fact]
        public void BookingValidator_ShouldFail_WhenEmailIsInvalid()
        {
            // Arrange
            var dto = new BookingRequestDto
            {
                CampId         = 1,
                CheckIn        = DateTime.Today.AddDays(1),
                CheckOut       = DateTime.Today.AddDays(3),
                GuestFirstName = "John",
                GuestLastName  = "Doe",
                GuestEmail     = "not-an-email",
                GuestPhone     = "1234567890",
                BillingAddress = "123 Main St",
                City           = "NYC",
                ZipCode        = "10001",
                Country        = "US"
            };

            // Act
            var result = _bookingValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.GuestEmail);
        }

        [Fact]
        public void BookingValidator_ShouldFail_WhenCheckOutBeforeCheckIn()
        {
            // Arrange
            var dto = new BookingRequestDto
            {
                CampId         = 1,
                CheckIn        = DateTime.Today.AddDays(3),
                CheckOut       = DateTime.Today.AddDays(1), // Before check-in
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
            var result = _bookingValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.CheckOut);
        }

        [Fact]
        public void BookingValidator_ShouldPass_WhenAllFieldsAreValid()
        {
            // Arrange
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
            var result = _bookingValidator.TestValidate(dto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void CampValidator_ShouldFail_WhenNameIsEmpty()
        {
            // Arrange
            var dto = new CampCreateDto
            {
                Name          = "",
                Description   = "A great camp",
                Location      = "NC",
                ImageUrl      = "https://example.com/img.jpg",
                Capacity      = 4,
                PricePerNight = 85
            };

            // Act
            var result = _campCreateValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Name);
        }

        [Fact]
        public void CampValidator_ShouldFail_WhenCapacityIsZero()
        {
            // Arrange
            var dto = new CampCreateDto
            {
                Name          = "Test Camp",
                Description   = "A great camp",
                Location      = "NC",
                ImageUrl      = "https://example.com/img.jpg",
                Capacity      = 0,
                PricePerNight = 85
            };

            // Act
            var result = _campCreateValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Capacity);
        }

        [Fact]
        public void CampValidator_ShouldFail_WhenImageUrlIsInvalid()
        {
            // Arrange
            var dto = new CampCreateDto
            {
                Name          = "Test Camp",
                Description   = "A great camp",
                Location      = "NC",
                ImageUrl      = "not-a-valid-url",
                Capacity      = 4,
                PricePerNight = 85
            };

            // Act
            var result = _campCreateValidator.TestValidate(dto);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ImageUrl);
        }

        [Fact]
        public void CampValidator_ShouldPass_WhenAllFieldsAreValid()
        {
            // Arrange
            var dto = new CampCreateDto
            {
                Name          = "Forest Hollow",
                Description   = "Hidden gem in old-growth forest",
                Location      = "WA",
                ImageUrl      = "https://example.com/img.jpg",
                Capacity      = 4,
                PricePerNight = 85
            };

            // Act
            var result = _campCreateValidator.TestValidate(dto);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}