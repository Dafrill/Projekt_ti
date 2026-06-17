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
    [Authorize] // cały kontroler wymaga bycia zalogowanym
    public class MessagesController : ControllerBase
    {
        private readonly DataContext _context;

        public MessagesController(DataContext context)
        {
            _context = context;
        }

        // 1. WYSYŁANIE WIADOMOŚCI (POST /api/messages)
        [HttpPost]
        public async Task<ActionResult<Message>> SendMessage(Message message)
        {
            // Odczytujemy ID nadawcy bezpośrednio z tokenu JWT (bezpieczeństwo!)
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized("Brak tokenu autoryzacji.");

            message.SenderId = int.Parse(userIdClaim);
            message.SentAt = DateTime.UtcNow;

            // Sprawdzamy, czy ogłoszenie w ogóle istnieje
            var adExists = await _context.Advertisements.AnyAsync(a => a.Id == message.AdvertisementId);
            if (!adExists) return BadRequest("Nie możesz wysłać wiadomości do nieistniejącego ogłoszenia.");

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        // 2. SKRZYNKA ODBIORCZA I NADAWCZA (GET /api/messages)
        // Zwraca historię wiadomości powiązanych z zalogowanym użytkownikiem
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMyMessages()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized();

            int currentUserId = int.Parse(userIdClaim);

            // Pobieramy wiadomości, gdzie użytkownik jest NADAWCĄ lub ODBIORCĄ
            var messages = await _context.Messages
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }
    }
}