using Microsoft.EntityFrameworkCore;
using LocalMarketplace.Models;

namespace LocalMarketplace.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Advertisement> Advertisements { get; set; }

        public DbSet<Message> Messages { get; set; }

        public DbSet<Favorite> Favorites { get; set; }
    }
}