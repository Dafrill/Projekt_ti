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
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly DataContext _context;

        public MessagesController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized("Brak tokenu autoryzacji.");

            int senderId = int.Parse(userIdClaim);

            var adExists = await _context.Advertisements.AnyAsync(a => a.Id == request.AdvertisementId);
            if (!adExists) return BadRequest("Nie możesz wysłać wiadomości do nieistniejącego ogłoszenia.");

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                AdvertisementId = request.AdvertisementId,
                Content = request.Content,
                ImageUrl = request.ImageUrl,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var sender = await _context.Users.FindAsync(senderId);
            var receiver = await _context.Users.FindAsync(request.ReceiverId);
            var ad = await _context.Advertisements.FindAsync(request.AdvertisementId);

            return Ok(new
            {
                message.Id,
                message.SenderId,
                message.ReceiverId,
                message.AdvertisementId,
                message.Content,
                message.ImageUrl,
                message.SentAt,
                SenderEmail = sender!.Email,
                SenderNickname = sender!.Nickname,
                ReceiverEmail = receiver!.Email,
                ReceiverNickname = receiver!.Nickname,
                AdvertisementTitle = ad?.Title ?? ""
            });
        }

        [HttpGet]
        public async Task<ActionResult> GetMyMessages()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null) return Unauthorized();

            int currentUserId = int.Parse(userIdClaim);

            var messages = await _context.Messages
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .Select(m => new
                {
                    m.Id,
                    m.SenderId,
                    m.ReceiverId,
                    m.AdvertisementId,
                    m.Content,
                    m.ImageUrl,
                    m.SentAt,
                    SenderEmail = _context.Users.Where(u => u.Id == m.SenderId).Select(u => u.Email).FirstOrDefault() ?? "",
                    SenderNickname = _context.Users.Where(u => u.Id == m.SenderId).Select(u => u.Nickname).FirstOrDefault() ?? "",
                    ReceiverEmail = _context.Users.Where(u => u.Id == m.ReceiverId).Select(u => u.Email).FirstOrDefault() ?? "",
                    ReceiverNickname = _context.Users.Where(u => u.Id == m.ReceiverId).Select(u => u.Nickname).FirstOrDefault() ?? "",
                    AdvertisementTitle = _context.Advertisements.Where(a => a.Id == m.AdvertisementId).Select(a => a.Title).FirstOrDefault() ?? "Nieznane ogłoszenie"
                })
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }
    }

    public class SendMessageRequest
    {
        public int ReceiverId { get; set; }
        public int AdvertisementId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
