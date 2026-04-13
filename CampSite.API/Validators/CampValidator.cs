using CampSite.API.DTOs;
using FluentValidation;

namespace CampSite.API.Validators
{
    public class CampCreateValidator : AbstractValidator<CampCreateDto>
    {
        public CampCreateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Camp name is required.")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required.")
                .MaximumLength(120).WithMessage("Location cannot exceed 120 characters.");

            RuleFor(x => x.ImageUrl)
                .NotEmpty().WithMessage("Image URL is required.")
                .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
                .WithMessage("Image URL must be a valid URL.");

            RuleFor(x => x.Capacity)
                .GreaterThan(0).WithMessage("Capacity must be at least 1.")
                .LessThanOrEqualTo(100).WithMessage("Capacity cannot exceed 100.");

            RuleFor(x => x.PricePerNight)
                .GreaterThan(0).WithMessage("Price per night must be greater than 0.");

            RuleFor(x => x.WeekendPricePerNight)
                .NotNull().WithMessage("Weekend price is required.")
                .GreaterThan(0).WithMessage("Weekend price must be greater than 0.");
        }
    }

    public class CampUpdateValidator : AbstractValidator<CampUpdateDto>
    {
        public CampUpdateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Camp name is required.")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required.")
                .MaximumLength(120).WithMessage("Location cannot exceed 120 characters.");

            RuleFor(x => x.ImageUrl)
                .NotEmpty().WithMessage("Image URL is required.")
                .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
                .WithMessage("Image URL must be a valid URL.");

            RuleFor(x => x.Capacity)
                .GreaterThan(0).WithMessage("Capacity must be at least 1.")
                .LessThanOrEqualTo(100).WithMessage("Capacity cannot exceed 100.");

            RuleFor(x => x.PricePerNight)
                .GreaterThan(0).WithMessage("Price per night must be greater than 0.");

            RuleFor(x => x.WeekendPricePerNight)
                .NotNull().WithMessage("Weekend price is required.")
                .GreaterThan(0).WithMessage("Weekend price must be greater than 0.");
        }
    }
}