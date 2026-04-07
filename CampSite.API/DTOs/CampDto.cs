namespace CampSite.API.DTOs
{
    public class CampResponseDto
    {
        public int     Id                   { get; set; }
        public string  Name                 { get; set; } = string.Empty;
        public string  Description          { get; set; } = string.Empty;
        public string  Location             { get; set; } = string.Empty;
        public string  ImageUrl             { get; set; } = string.Empty;
        public int     Capacity             { get; set; }
        public decimal PricePerNight        { get; set; }
        public decimal? WeekendPricePerNight{ get; set; }
        public bool    IsActive             { get; set; }
        public double  AverageRating        { get; set; }
        public int     TotalRatings         { get; set; }
    }

    public class CampCreateDto
    {
        public string  Name                 { get; set; } = string.Empty;
        public string  Description          { get; set; } = string.Empty;
        public string  Location             { get; set; } = string.Empty;
        public string  ImageUrl             { get; set; } = string.Empty;
        public int     Capacity             { get; set; }
        public decimal PricePerNight        { get; set; }
        public decimal? WeekendPricePerNight{ get; set; }
    }

    public class CampUpdateDto
    {
        public string  Name                 { get; set; } = string.Empty;
        public string  Description          { get; set; } = string.Empty;
        public string  Location             { get; set; } = string.Empty;
        public string  ImageUrl             { get; set; } = string.Empty;
        public int     Capacity             { get; set; }
        public decimal PricePerNight        { get; set; }
        public decimal? WeekendPricePerNight{ get; set; }
        public bool    IsActive             { get; set; }
    }

    public class CampSearchDto
    {
        public DateTime CheckIn  { get; set; } = DateTime.Today;
        public DateTime CheckOut { get; set; } = DateTime.Today.AddDays(1);
        public int?     Capacity { get; set; }
        public int      Page     { get; set; } = 1;
        public int      PageSize { get; set; } = 6;
    }

    public class PagedCampResponseDto
    {
        public List<CampResponseDto> Camps      { get; set; } = new();
        public int                   TotalCount { get; set; }
        public int                   Page       { get; set; }
        public int                   PageSize   { get; set; }
        public int                   TotalPages { get; set; }
    }
}