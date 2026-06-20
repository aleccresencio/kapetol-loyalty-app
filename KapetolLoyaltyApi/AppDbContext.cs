using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<PointsLedger> PointsLedger { get; set; }
    public DbSet<Reward> Rewards { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>().HasData(
            new Customer
            {
                Id = 1,
                Name = "Alec Cresencio",
                Phone = "09279179977",
                QRCodeId = "5c0ad0f3-da3f-4885-9037-b276bb68a7c1",
                CreatedAt = new DateTime(2026, 6, 20, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<Reward>().HasData(
            new Reward { Id = 1, Name = "Free Coffee", Description = "Redeem for a free cup of coffee", PointsCost = 50, IsActive = true },
            new Reward { Id = 2, Name = "Free Pastry", Description = "Redeem for a free pastry of your choice", PointsCost = 80, IsActive = true },
            new Reward { Id = 3, Name = "Free Meal", Description = "Redeem for a free meal set", PointsCost = 150, IsActive = true },
            new Reward { Id = 4, Name = "10% Discount", Description = "Get 10% off your next order", PointsCost = 30, IsActive = true }
        );
    }
}