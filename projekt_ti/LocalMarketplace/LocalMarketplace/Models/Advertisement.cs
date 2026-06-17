using System;

namespace LocalMarketplace.Models
{
    public class Advertisement
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty; // Nauka, Meble, Elektronika, Usługi
        public string Location { get; set; } = string.Empty; // np. DS-2 Babilon, DS-1 Olimp
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = false; // Do moderacji w panelu admina

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; } // Kto dodał ogłoszenie
    }
}