using CampSite.API.DTOs;
using FluentValidation;

namespace CampSite.API.Validators
{
    public class BookingRequestValidator : AbstractValidator<BookingRequestDto>
    {
        public BookingRequestValidator()
        {
            RuleFor(x => x.CampId)
                .GreaterThan(0).WithMessage("Valid camp is required.");

            RuleFor(x => x.CheckIn)
                .NotEmpty().WithMessage("Check-in date is required.")
                .GreaterThanOrEqualTo(DateTime.Today)
                .WithMessage("Check-in date cannot be in the past.");

            RuleFor(x => x.CheckOut)
                .NotEmpty().WithMessage("Check-out date is required.")
                .GreaterThan(x => x.CheckIn)
                .WithMessage("Check-out must be after check-in.");

            RuleFor(x => x.GuestFirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(50).WithMessage("Max 50 characters.");

            RuleFor(x => x.GuestLastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(50).WithMessage("Max 50 characters.");

            RuleFor(x => x.GuestEmail)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Valid email required.");

            RuleFor(x => x.GuestPhone)
                .NotEmpty().WithMessage("Phone is required.")
                .Matches(@"^\+?[\d\s\-\(\)]{7,15}$")
                .WithMessage("Valid phone number required.");

            RuleFor(x => x.BillingAddress)
                .NotEmpty().WithMessage("Billing address is required.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("City is required.");

            RuleFor(x => x.ZipCode)
                .NotEmpty().WithMessage("ZIP code is required.");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("Country is required.");
        }
    }

    public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Valid email required.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Min 6 characters.");
        }
    }
}