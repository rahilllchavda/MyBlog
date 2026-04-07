using AutoMapper;
using CampSite.API.DTOs;
using CampSite.API.Models;

namespace CampSite.API.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Camp, CampResponseDto>()
                .ForMember(dest => dest.AverageRating,
                    opt => opt.MapFrom(src =>
                        src.Ratings.Any()
                            ? Math.Round(src.Ratings.Average(r => r.Stars), 1)
                            : 0.0))
                .ForMember(dest => dest.TotalRatings,
                    opt => opt.MapFrom(src => src.Ratings.Count));

            CreateMap<CampCreateDto, Camp>()
                .ForMember(dest => dest.IsActive,
                    opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<CampUpdateDto, Camp>();

            CreateMap<Booking, BookingResponseDto>()
                .ForMember(dest => dest.CampName,
                    opt => opt.MapFrom(src =>
                        src.Camp != null ? src.Camp.Name : string.Empty))
                .ForMember(dest => dest.CampLocation,
                    opt => opt.MapFrom(src =>
                        src.Camp != null ? src.Camp.Location : string.Empty))
                .ForMember(dest => dest.CampImageUrl,
                    opt => opt.MapFrom(src =>
                        src.Camp != null ? src.Camp.ImageUrl : string.Empty))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.RatingStars,
                    opt => opt.MapFrom(src =>
                        src.Rating != null ? src.Rating.Stars : (int?)null));

            CreateMap<BookingRequestDto, Booking>()
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(_ => BookingStatus.Active))
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<Rating, RatingResponseDto>()
                .ForMember(dest => dest.CampName,
                    opt => opt.MapFrom(src =>
                        src.Camp != null ? src.Camp.Name : string.Empty));

            CreateMap<RatingRequestDto, Rating>()
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow));
        }
    }
}