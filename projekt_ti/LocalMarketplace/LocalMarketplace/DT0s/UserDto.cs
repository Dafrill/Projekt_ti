namespace LocalMarketplace.DTOs
{
    public class UserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Nickname { get; set; }
    }
}