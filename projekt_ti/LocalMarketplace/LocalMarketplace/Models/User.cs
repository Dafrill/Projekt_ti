namespace LocalMarketplace.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; // Bezpieczne hasło
        public string Role { get; set; } = "Student"; // "Student" lub "Admin"
    }
}