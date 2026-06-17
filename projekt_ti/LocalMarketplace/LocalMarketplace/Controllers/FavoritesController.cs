using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LocalMarketplace.Data;
using LocalMarketplace.Models;
using System.Security.Claims;

namespace LocalMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Cały kontroler wymaga bycia zalogowanym
    public class FavoritesController : ControllerBase
    {
        private readonly DataContext _context;

        public FavoritesController(DataContext context)
        {
            _context = context;
        }

        // 1. Pobierz moje ulubione ogłoszenia
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Advertisement>>> GetMyFavorites()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized("Brak tokenu autoryzacji.");
            int currentUserId = int.Parse(userIdClaim);

            var favorites = await _context.Favorites
                .Where(f => f.UserId == currentUserId)
                .Include(f => f.Advertisement) // Pobieramy pełne dane ogłoszenia
                .Select(f => f.Advertisement)
                .ToListAsync();

            return Ok(favorites);
        }

        // 2. Dodaj ogłoszenie do ulubionych
        [HttpPost("{advertisementId}")]
        public async Task<IActionResult> AddToFavorites(int advertisementId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized("Brak tokenu autoryzacji.");
            int currentUserId = int.Parse(userIdClaim);

            // Sprawdź, czy ogłoszenie istnieje
            var adExists = await _context.Advertisements.AnyAsync(a => a.Id == advertisementId);
            if (!adExists) return NotFound("Nie ma takiego ogłoszenia.");

            // Sprawdź, czy już nie jest dodane
            var alreadyFavorite = await _context.Favorites
                .AnyAsync(f => f.UserId == currentUserId && f.AdvertisementId == advertisementId);

            if (alreadyFavorite) return BadRequest("To ogłoszenie jest już w ulubionych.");

            var favorite = new Favorite
            {
                UserId = currentUserId,
                AdvertisementId = advertisementId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok("Dodano do ulubionych.");
        }

        // 3. Usuń z ulubionych
        [HttpDelete("{advertisementId}")]
        public async Task<IActionResult> RemoveFromFavorites(int advertisementId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized("Brak tokenu autoryzacji.");
            int currentUserId = int.Parse(userIdClaim);

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == currentUserId && f.AdvertisementId == advertisementId);

            if (favorite == null) return NotFound("Nie znaleziono takiego ogłoszenia w ulubionych.");

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok("Usunięto z ulubionych.");
        }
    }
}