using CampSite.API.DTOs;
using CampSite.API.Models;
using CampSite.API.Repositories;
using CampSite.API.Services;
using Moq;
using Xunit;
using FluentAssertions;

namespace CampSite.Tests
{
    public class CampServiceTests
    {
        private readonly Mock<ICampRepository> _mockCampRepo;
        private readonly CampService _campService;

        public CampServiceTests()
        {
            _mockCampRepo = new Mock<ICampRepository>();
            _campService  = new CampService(_mockCampRepo.Object);
        }

        [Fact]
        public async Task GetAvailableCampsAsync_ShouldReturnPagedCamps()
        {
            // Arrange
            var camps = new List<Camp>
            {
                new Camp
                {
                    Id            = 1,
                    Name          = "Pinewood Haven",
                    Description   = "A pine forest camp",
                    Location      = "NC",
                    ImageUrl      = "https://example.com/img1.jpg",
                    Capacity      = 4,
                    PricePerNight = 85,
                    IsActive      = true,
                    Ratings       = new List<Rating>()
                },
                new Camp
                {
                    Id            = 2,
                    Name          = "Riverside Retreat",
                    Description   = "By the river",
                    Location      = "TN",
                    ImageUrl      = "https://example.com/img2.jpg",
                    Capacity      = 2,
                    PricePerNight = 65,
                    IsActive      = true,
                    Ratings       = new List<Rating>()
                }
            };

            _mockCampRepo
                .Setup(r => r.GetAvailableCampsAsync(
                    It.IsAny<DateTime>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<int?>()))
                .ReturnsAsync(camps);

            var searchDto = new CampSearchDto
            {
                CheckIn  = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(2),
                Page     = 1,
                PageSize = 6
            };

            // Act
            var result = await _campService.GetAvailableCampsAsync(searchDto);

            // Assert
            result.Should().NotBeNull();
            result.Camps.Should().HaveCount(2);
            result.TotalCount.Should().Be(2);
            result.TotalPages.Should().Be(1);
        }

        [Fact]
        public async Task GetAvailableCampsAsync_ShouldFilterByCapacity()
        {
            // Arrange
            var camps = new List<Camp>
            {
                new Camp
                {
                    Id            = 1,
                    Name          = "Summit Camp",
                    Description   = "Mountain top",
                    Location      = "CO",
                    ImageUrl      = "https://example.com/img3.jpg",
                    Capacity      = 8,
                    PricePerNight = 120,
                    IsActive      = true,
                    Ratings       = new List<Rating>()
                }
            };

            _mockCampRepo
                .Setup(r => r.GetAvailableCampsAsync(
                    It.IsAny<DateTime>(),
                    It.IsAny<DateTime>(),
                    8))
                .ReturnsAsync(camps);

            var searchDto = new CampSearchDto
            {
                CheckIn  = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(1),
                Capacity = 8,
                Page     = 1,
                PageSize = 6
            };

            // Act
            var result = await _campService.GetAvailableCampsAsync(searchDto);

            // Assert
            result.Camps.Should().HaveCount(1);
            result.Camps.First().Capacity.Should().BeGreaterThanOrEqualTo(8);
        }

        [Fact]
        public async Task GetAvailableCampsAsync_ShouldReturnEmpty_WhenNoCampsAvailable()
        {
            // Arrange
            _mockCampRepo
                .Setup(r => r.GetAvailableCampsAsync(
                    It.IsAny<DateTime>(),
                    It.IsAny<DateTime>(),
                    It.IsAny<int?>()))
                .ReturnsAsync(new List<Camp>());

            var searchDto = new CampSearchDto
            {
                CheckIn  = DateTime.Today,
                CheckOut = DateTime.Today.AddDays(1),
                Page     = 1,
                PageSize = 6
            };

            // Act
            var result = await _campService.GetAvailableCampsAsync(searchDto);

            // Assert
            result.Camps.Should().BeEmpty();
            result.TotalCount.Should().Be(0);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenCampNotFound()
        {
            // Arrange
            _mockCampRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Camp?)null);

            // Act
            var result = await _campService.GetByIdAsync(999);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateCamp_WithValidData()
        {
            // Arrange
            var createDto = new CampCreateDto
            {
                Name          = "New Camp",
                Description   = "A brand new camp",
                Location      = "CA",
                ImageUrl      = "https://example.com/new.jpg",
                Capacity      = 4,
                PricePerNight = 100
            };

            var createdCamp = new Camp
            {
                Id            = 10,
                Name          = createDto.Name,
                Description   = createDto.Description,
                Location      = createDto.Location,
                ImageUrl      = createDto.ImageUrl,
                Capacity      = createDto.Capacity,
                PricePerNight = createDto.PricePerNight,
                IsActive      = true,
                Ratings       = new List<Rating>()
            };

            _mockCampRepo
                .Setup(r => r.CreateAsync(It.IsAny<Camp>()))
                .ReturnsAsync(createdCamp);

            // Act
            var result = await _campService.CreateAsync(createDto);

            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be("New Camp");
            result.Capacity.Should().Be(4);
            result.PricePerNight.Should().Be(100);
        }

        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenCampNotFound()
        {
            // Arrange
            _mockCampRepo
                .Setup(r => r.ExistsAsync(It.IsAny<int>()))
                .ReturnsAsync(false);

            // Act
            var act = async () => await _campService.DeleteAsync(999);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public void CalculateTotalPrice_ShouldApplyWeekendPricing()
        {
            // Arrange — find next Friday
            var checkIn = DateTime.Today;
            while (checkIn.DayOfWeek != DayOfWeek.Friday)
                checkIn = checkIn.AddDays(1);

            var checkOut = checkIn.AddDays(3); // Fri, Sat, Sun

            var camp = new Camp
            {
                PricePerNight        = 100,
                WeekendPricePerNight = 150
            };

            // Act
            var total = CampService.CalculateTotalPrice(camp, checkIn, checkOut);

            // Assert — 3 weekend nights at 150
            total.Should().Be(450);
        }
    }
}   