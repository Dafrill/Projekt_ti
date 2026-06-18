namespace LocalMarketplace.Models
{
    public class Reaction
    {
        public int Id { get; set; }
        public int AdvertisementId { get; set; }
        public int UserId { get; set; }
        public string Emoji { get; set; } = string.Empty;
    }
}
