using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LocalMarketplace.Data;
using LocalMarketplace.Models;
using System.Security.Claims;

namespace LocalMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReactionsController : ControllerBase
    {
        private readonly DataContext _context;

        public ReactionsController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{advertisementId}")]
        public async Task<ActionResult<object>> GetReactions(int advertisementId)
        {
            var reactions = await _context.Reactions
                .Where(r => r.AdvertisementId == advertisementId)
                .GroupBy(r => r.Emoji)
                .Select(g => new { emoji = g.Key, count = g.Count() })
                .ToListAsync();

            var userIdStr = User.FindFirstValue("UserId");
            int? currentUserId = userIdStr != null ? int.Parse(userIdStr) : null;

            var userReaction = currentUserId != null
                ? await _context.Reactions
                    .Where(r => r.AdvertisementId == advertisementId && r.UserId == currentUserId.Value)
                    .Select(r => r.Emoji)
                    .FirstOrDefaultAsync()
                : null;

            return Ok(new { reactions, userReaction });
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult> ToggleReaction([FromBody] ReactionRequest request)
        {
            var userId = int.Parse(User.FindFirstValue("UserId")!);
            var user = await _context.Users.FindAsync(userId);
            bool isAdmin = user?.Role == "Admin";

            var existing = await _context.Reactions
                .FirstOrDefaultAsync(r => r.AdvertisementId == request.AdvertisementId && r.UserId == userId && r.Emoji == request.Emoji);

            if (existing != null)
            {
                if (isAdmin)
                {
                    _context.Reactions.Add(new Reaction
                    {
                        AdvertisementId = request.AdvertisementId,
                        UserId = userId,
                        Emoji = request.Emoji
                    });
                }
                else
                {
                    _context.Reactions.Remove(existing);
                }
            }
            else
            {
                _context.Reactions.Add(new Reaction
                {
                    AdvertisementId = request.AdvertisementId,
                    UserId = userId,
                    Emoji = request.Emoji
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class ReactionRequest
    {
        public int AdvertisementId { get; set; }
        public string Emoji { get; set; } = string.Empty;
    }
}
