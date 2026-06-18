namespace LocalMarketplace.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int AdvertisementId { get; set; }
        public int UserId { get; set; }
        public int? ParentCommentId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
