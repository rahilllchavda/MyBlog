using CampSite.API.DTOs;
using CampSite.API.Models;
using CampSite.API.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace CampSite.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly IConfiguration                    _configuration;
        private readonly AuthService                       _authService;

        public AuthServiceTests()
        {
            var store = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(
                store.Object, null!, null!, null!, null!,
                null!, null!, null!, null!);

            var inMemorySettings = new Dictionary<string, string>
            {
                { "JwtSettings:Secret",       "CampSite_SuperSecret_JWT_Key_2025_MustBe32Chars!!" },
                { "JwtSettings:Issuer",        "CampSiteAPI"    },
                { "JwtSettings:Audience",      "CampSiteClient" },
                { "JwtSettings:ExpiryInDays",  "7"              }
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();

            _authService = new AuthService(
                _mockUserManager.Object,
                _configuration);
        }

        [Fact]
        public async Task LoginAsync_ShouldThrow_WhenUserNotFound()
        {
            // Arrange
            _mockUserManager
                .Setup(m => m.FindByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync((ApplicationUser?)null);

            var dto = new LoginRequestDto
            {
                Email    = "notfound@test.com",
                Password = "Test@123"
            };

            // Act
            var act = async () => await _authService.LoginAsync(dto);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("Invalid email or password.");
        }

        [Fact]
        public async Task LoginAsync_ShouldThrow_WhenPasswordIsWrong()
        {
            // Arrange
            var user = new ApplicationUser
            {
                Email     = "user@test.com",
                FirstName = "Test",
                LastName  = "User",
                IsAdmin   = false
            };

            _mockUserManager
                .Setup(m => m.FindByEmailAsync("user@test.com"))
                .ReturnsAsync(user);

            _mockUserManager
                .Setup(m => m.CheckPasswordAsync(user, It.IsAny<string>()))
                .ReturnsAsync(false);

            var dto = new LoginRequestDto
            {
                Email    = "user@test.com",
                Password = "WrongPassword"
            };

            // Act
            var act = async () => await _authService.LoginAsync(dto);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("Invalid email or password.");
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreValid()
        {
            // Arrange
            var user = new ApplicationUser
            {
                Id        = Guid.NewGuid().ToString(),
                Email     = "admin@campsite.com",
                UserName  = "admin@campsite.com",
                FirstName = "Camp",
                LastName  = "Admin",
                IsAdmin   = true
            };

            _mockUserManager
                .Setup(m => m.FindByEmailAsync("admin@campsite.com"))
                .ReturnsAsync(user);

            _mockUserManager
                .Setup(m => m.CheckPasswordAsync(user, "Admin@123"))
                .ReturnsAsync(true);

            _mockUserManager
                .Setup(m => m.GetRolesAsync(user))
                .ReturnsAsync(new List<string> { "Admin" });

            var dto = new LoginRequestDto
            {
                Email    = "admin@campsite.com",
                Password = "Admin@123"
            };

            // Act
            var result = await _authService.LoginAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.Token.Should().NotBeNullOrEmpty();
            result.IsAdmin.Should().BeTrue();
            result.Email.Should().Be("admin@campsite.com");
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrow_WhenEmailAlreadyExists()
        {
            // Arrange
            var existingUser = new ApplicationUser
            {
                Email = "existing@test.com"
            };

            _mockUserManager
                .Setup(m => m.FindByEmailAsync("existing@test.com"))
                .ReturnsAsync(existingUser);

            var dto = new RegisterRequestDto
            {
                FirstName = "John",
                LastName  = "Doe",
                Email     = "existing@test.com",
                Password  = "Test@123"
            };

            // Act
            var act = async () => await _authService.RegisterAsync(dto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Email is already registered.");
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnToken_WhenRegistrationSucceeds()
        {
            // Arrange
            _mockUserManager
                .Setup(m => m.FindByEmailAsync(It.IsAny<string>()))
                .ReturnsAsync((ApplicationUser?)null);

            _mockUserManager
                .Setup(m => m.CreateAsync(
                    It.IsAny<ApplicationUser>(),
                    It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);

            _mockUserManager
                .Setup(m => m.AddToRoleAsync(
                    It.IsAny<ApplicationUser>(),
                    It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);

            _mockUserManager
                .Setup(m => m.GetRolesAsync(It.IsAny<ApplicationUser>()))
                .ReturnsAsync(new List<string> { "User" });

            var dto = new RegisterRequestDto
            {
                FirstName = "Jane",
                LastName  = "Doe",
                Email     = "jane@test.com",
                Password  = "Test@123"
            };

            // Act
            var result = await _authService.RegisterAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.Token.Should().NotBeNullOrEmpty();
            result.Email.Should().Be("jane@test.com");
            result.IsAdmin.Should().BeFalse();
        }
    }
}