using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using LocalMarketplace.Data;
using LocalMarketplace.Models;
using LocalMarketplace.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LocalMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(DataContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 0. PROFIL: api/auth/profile
        [HttpGet("profile")]
        public async Task<ActionResult<object>> GetProfile()
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim.Value));
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Nickname,
                user.AvatarUrl,
                user.Role
            });
        }

        // 0a. EDYCJA PROFILU: api/auth/profile
        [HttpPut("profile")]
        public async Task<ActionResult<string>> UpdateProfile(UpdateProfileDto request)
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim.Value));
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(request.Nickname))
            {
                var nickTaken = await _context.Users.AnyAsync(u => u.Nickname == request.Nickname && u.Id != user.Id);
                if (nickTaken) return BadRequest("Nick jest już zajęty");
                user.Nickname = request.Nickname;
            }

            if (request.AvatarUrl != null)
                user.AvatarUrl = request.AvatarUrl;

            await _context.SaveChangesAsync();

            string token = CreateToken(user);
            return Ok(token);
        }

        // 1. REJESTRACJA: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            // Sprawdź, czy użytkownik o takim mailu już istnieje
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Użytkownik o takim adresie e-mail już istnieje!");
            }

            // Haszowanie hasła (magia bezpieczeństwa)
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var nickname = !string.IsNullOrWhiteSpace(request.Nickname)
                ? request.Nickname
                : request.Email.Split('@')[0];

            if (await _context.Users.AnyAsync(u => u.Nickname == nickname))
            {
                nickname = nickname + (new Random().Next(100, 999));
            }

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "Student",
                Nickname = nickname
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Rejestracja pomyślna!");
        }

        // 2. LOGOWANIE: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return BadRequest("Nie znaleziono użytkownika.");
            }

            // Weryfikacja zahaszowanego hasła
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Błędne hasło.");
            }

            if (user.IsBanned)
            {
                return BadRequest("Twoje konto zostało zablokowane.");
            }

            // Jeśli hasło pasuje, generujemy token JWT
            string token = CreateToken(user);
            return Ok(token); // Ten token React zapisze sobie w pamięci
        }

        // Metoda pomocnicza generująca token JWT
        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserId", user.Id.ToString()),
                new Claim("Nickname", string.IsNullOrEmpty(user.Nickname) ? user.Email.Split('@')[0] : user.Nickname),
                new Claim("AvatarUrl", user.AvatarUrl ?? "")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Token jest ważny 24 godziny
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }
    }
}