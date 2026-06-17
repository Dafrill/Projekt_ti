namespace LocalMarketplace.Models
{
    public class Favorite
    {
        public int Id { get; set; }
        public int UserId { get; set; } // kto polubił
        public int AdvertisementId { get; set; } // co polubił

        public Advertisement? Advertisement { get; set; }
    }
}