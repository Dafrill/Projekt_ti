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
    public class AdvertisementsController : ControllerBase
    {
        private readonly DataContext _context;

        public AdvertisementsController(DataContext context)
        {
            _context = context;
        }

        // 1. CZĘŚĆ PUBLICZNA


        // GET /api/advertisements (Pobieranie zatwierdzonych + Filtry)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Advertisement>>> GetAdvertisements(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] string? location,
            [FromQuery] bool myOnly = false)
        {
            var query = _context.Advertisements.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Title.ToLower().Contains(search.ToLower())
                                      || a.Description.ToLower().Contains(search.ToLower()));
            }

            if (!string.IsNullOrEmpty(category)) query = query.Where(a => a.Category.ToLower() == category.ToLower());
            if (!string.IsNullOrEmpty(location)) query = query.Where(a => a.Location.ToLower() == location.ToLower());

            if (myOnly)
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (userIdClaim != null)
                {
                    int currentUserId = int.Parse(userIdClaim);
                    query = query.Where(a => a.UserId == currentUserId);
                }
            }

            return await query.Include(a => a.User).OrderByDescending(a => a.CreatedAt).ToListAsync();
        }

        // GET /api/advertisements/{id} (Szczegóły)
        [HttpGet("{id}")]
        public async Task<ActionResult<Advertisement>> GetAdvertisement(int id)
        {
            var advertisement = await _context.Advertisements.Include(a => a.User).FirstOrDefaultAsync(a => a.Id == id);
            if (advertisement == null) return NotFound("Nie znaleziono ogłoszenia.");
            return advertisement;
        }

        // 2. CZĘŚĆ STUDENCKA (ZABEZPIECZONA JWT)


        // POST /api/advertisements (Dodawanie ogłoszenia)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Advertisement>> CreateAdvertisement(Advertisement advertisement)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized("Brak tokenu.");

            advertisement.UserId = int.Parse(userIdClaim);
            advertisement.IsApproved = false; // Każde nowe ogłoszenie trafia do poczekalni admina
            advertisement.CreatedAt = DateTime.UtcNow;

            _context.Advertisements.Add(advertisement);
            await _context.SaveChangesAsync();
            return Ok(advertisement);
        }

        // PUT /api/advertisements/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAdvertisement(int id, Advertisement updatedAd)
        {
            var advertisement = await _context.Advertisements.FindAsync(id);
            if (advertisement == null) return NotFound("Nie ma takiego ogłoszenia.");

            // Sprawdzamy czy student edytuje SWOJE ogłoszenie (ochrona przed oszustami)
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null || advertisement.UserId != int.Parse(userIdClaim))
            {
                return StatusCode(403, "Możesz edytować tylko własne ogłoszenia!");
            }

            // Podmiana treści tekstowych
            advertisement.Title = updatedAd.Title;
            advertisement.Description = updatedAd.Description;
            advertisement.Price = updatedAd.Price;
            advertisement.Category = updatedAd.Category;
            advertisement.Location = updatedAd.Location;
            advertisement.ImageUrl = updatedAd.ImageUrl;
            advertisement.IsApproved = false; // Po edycji znowu sprawdzamy czy nie ma tam banów

            await _context.SaveChangesAsync();
            return Ok("Ogłoszenie zaktualizowane i wysłane do ponownej moderacji.");
        }

        // 3. MODUŁ ADMINISTRACYJNY (CMS / MODERACJA)
        // GET /api/advertisements/unapproved (Admin widzi poczekalnię)
        [HttpGet("unapproved")]
        [Authorize] // W pełnej wersji byłoby [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Advertisement>>> GetUnapprovedAdvertisements()
        {
            // Zwraca tylko ogłoszenia czekające na akceptację
            return await _context.Advertisements.Where(a => !a.IsApproved).ToListAsync();
        }

        // PUT /api/advertisements/{id}/approve (Zatwierdzanie przez Admina)
        [HttpPut("{id}/approve")]
        [Authorize]
        public async Task<IActionResult> ApproveAdvertisement(int id)
        {
            var advertisement = await _context.Advertisements.FindAsync(id);
            if (advertisement == null) return NotFound("Nie znaleziono ogłoszenia.");

            advertisement.IsApproved = true; // Admin klika "Akceptuj" na froncie i ogłoszenie ląduje na stronie głównej
            await _context.SaveChangesAsync();

            return Ok("Ogłoszenie zostało pomyślnie zatwierdzone!");
        }

        // DELETE /api/advertisements/{id} (Usuwanie - Admin usuwa syf, student usuwa swoje)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAdvertisement(int id)
        {
            var advertisement = await _context.Advertisements.FindAsync(id);
            if (advertisement == null) return NotFound("Ogłoszenie nie istnieje.");

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null || advertisement.UserId != int.Parse(userIdClaim))
            {
                return StatusCode(403, "Możesz usunąć tylko własne ogłoszenia!");
            }

            _context.Advertisements.Remove(advertisement);
            await _context.SaveChangesAsync();

            return Ok("Ogłoszenie zostało usunięte.");
        }
    }
}