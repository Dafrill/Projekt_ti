using System;

namespace LocalMarketplace.Models
{
    public class Message
    {
        public int Id { get; set; }

        // Kto wysyła, kto odbiera
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }

        // Czego dotyczy wiadomość (ID ogłoszenia)
        public int AdvertisementId { get; set; }

        // Treść wiadomości
        public string Content { get; set; } = string.Empty;

        // Opcjonalne zdjęcie w wiadomości
        public string? ImageUrl { get; set; }

        // Kiedy wysłano
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}