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
    public class CommentsController : ControllerBase
    {
        private readonly DataContext _context;

        public CommentsController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{advertisementId}")]
        public async Task<ActionResult> GetComments(int advertisementId)
        {
            var comments = await _context.Comments
                .Where(c => c.AdvertisementId == advertisementId)
                .Join(_context.Users, c => c.UserId, u => u.Id, (c, u) => new
                {
                    c.Id,
                    c.Content,
                    c.UserId,
                    c.ParentCommentId,
                    c.CreatedAt,
                    UserEmail = u.Email,
                    UserNickname = u.Nickname
                })
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult> AddComment([FromBody] CommentRequest request)
        {
            var userId = int.Parse(User.FindFirstValue("UserId")!);

            var comment = new Comment
            {
                Content = request.Content,
                AdvertisementId = request.AdvertisementId,
                UserId = userId,
                ParentCommentId = request.ParentCommentId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return Ok(new
            {
                comment.Id,
                comment.Content,
                comment.UserId,
                comment.ParentCommentId,
                comment.CreatedAt,
                UserEmail = user!.Email,
                UserNickname = user!.Nickname
            });
        }
    }

    public class CommentRequest
    {
        public string Content { get; set; } = string.Empty;
        public int AdvertisementId { get; set; }
        public int? ParentCommentId { get; set; }
    }
}
