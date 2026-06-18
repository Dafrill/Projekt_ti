namespace LocalMarketplace.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Student";
        public string Nickname { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public bool IsBanned { get; set; } = false;
    }
}
