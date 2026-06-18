using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LocalMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public ImagesController(IWebHostEnvironment env)
        {
            _env = env;
        }

        // POST /api/images/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nie przesłano żadnego pliku.");

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("Plik jest za duży. Maksymalny rozmiar to 10 MB.");

            // Tworzymy folder 'wwwroot/uploads' jeśli nie istnieje
            var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generujemy unikalną nazwę pliku (żeby studenci nie nadpisali sobie zdjęć o nazwie 'rower.jpg')
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Zapisujemy plik na dysku serwera
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Zwracamy ścieżkę, którą React zapisze sobie w bazie w polu ImageUrl
            var fileUrl = $"/uploads/{uniqueFileName}";
            return Ok(new { url = fileUrl });
        }
    }
}