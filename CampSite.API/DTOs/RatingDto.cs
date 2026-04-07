namespace CampSite.API.DTOs
{
    public class RatingRequestDto
    {
        public string ReferenceNumber { get; set; } = string.Empty;
        public int CampId { get; set; }
        public int Stars { get; set; }
        public string? Comment { get; set; }
    }

    public class RatingResponseDto
    {
        public int Id { get; set; }
        public int CampId { get; set; }
        public string CampName { get; set; } = string.Empty;
        public int Stars { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}