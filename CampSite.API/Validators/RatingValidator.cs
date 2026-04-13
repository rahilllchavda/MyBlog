using CampSite.API.DTOs;
using FluentValidation;

namespace CampSite.API.Validators
{
    public class RatingRequestValidator : AbstractValidator<RatingRequestDto>
    {
        public RatingRequestValidator()
        {
            RuleFor(x => x.ReferenceNumber)
                .NotEmpty().WithMessage("Reference number is required.")
                .Length(8).WithMessage("Reference number must be 8 characters.");

            RuleFor(x => x.GuestEmail)
                .NotEmpty().WithMessage("Guest email is required.")
                .EmailAddress().WithMessage("Valid guest email is required.");

            RuleFor(x => x.CampId)
                .GreaterThan(0).WithMessage("Valid camp is required.");

            RuleFor(x => x.Stars)
                .InclusiveBetween(1, 5)
                .WithMessage("Stars must be between 1 and 5.");

            RuleFor(x => x.Comment)
                .MaximumLength(500)
                .WithMessage("Comment cannot exceed 500 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Comment));
        }
    }
}
