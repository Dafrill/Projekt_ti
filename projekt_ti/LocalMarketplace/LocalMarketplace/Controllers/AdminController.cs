using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LocalMarketplace.Data;
using LocalMarketplace.Models;

namespace LocalMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly DataContext _context;

        public AdminController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Nickname,
                    u.Role,
                    u.AvatarUrl,
                    u.IsBanned,
                    AdCount = _context.Advertisements.Count(a => a.UserId == u.Id)
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Nie znaleziono użytkownika.");
            return Ok(new
            {
                user.Id,
                user.Email,
                user.Nickname,
                user.Role,
                user.AvatarUrl,
                user.IsBanned
            });
        }

        [HttpGet("users/{id}/ads")]
        public async Task<ActionResult> GetUserAds(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Nie znaleziono użytkownika.");

            var ads = await _context.Advertisements
                .Where(a => a.UserId == id)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
            return Ok(ads);
        }

        [HttpPut("users/{id}/ban")]
        public async Task<ActionResult> BanUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Nie znaleziono użytkownika.");
            if (user.Role == "Admin") return BadRequest("Nie można zbanować admina.");

            user.IsBanned = true;
            await _context.SaveChangesAsync();
            return Ok("Użytkownik został zbanowany.");
        }

        [HttpPut("users/{id}/unban")]
        public async Task<ActionResult> UnbanUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Nie znaleziono użytkownika.");

            user.IsBanned = false;
            await _context.SaveChangesAsync();
            return Ok("Ban został zdjęty.");
        }

        [HttpDelete("users/{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Nie znaleziono użytkownika.");
            if (user.Role == "Admin") return BadRequest("Nie można usunąć admina.");

            _context.Advertisements.RemoveRange(_context.Advertisements.Where(a => a.UserId == id));
            _context.Messages.RemoveRange(_context.Messages.Where(m => m.SenderId == id || m.ReceiverId == id));
            _context.Favorites.RemoveRange(_context.Favorites.Where(f => f.UserId == id));
            _context.Reactions.RemoveRange(_context.Reactions.Where(r => r.UserId == id));
            _context.Comments.RemoveRange(_context.Comments.Where(c => c.UserId == id));
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok("Konto użytkownika zostało usunięte.");
        }

        [HttpDelete("comments/{id}")]
        public async Task<ActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound("Komentarz nie istnieje.");

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok("Komentarz został usunięty.");
        }
    }
}
