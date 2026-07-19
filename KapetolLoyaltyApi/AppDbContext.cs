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
            new Reward { Id = 1, Name = "10% Discount on Drinks", Description = "10% discount on any drinks", PointsCost = 20, IsActive = true },
            new Reward { Id = 2, Name = "Free Mediano Hot/Iced Tea", Description = "Redeem for a free mediano hot or iced tea", PointsCost = 30, IsActive = true },
            new Reward { Id = 3, Name = "Free Mediano Hot/Iced Americano", Description = "Redeem for a free mediano hot or iced americano", PointsCost = 40, IsActive = true },
            new Reward { Id = 4, Name = "20% Discount on Drinks", Description = "20% discount on any drinks", PointsCost = 60, IsActive = true },
            new Reward { Id = 5, Name = "Free Waffle (B6)", Description = "Redeem for a free waffle (B6)", PointsCost = 80, IsActive = true },
            new Reward { Id = 6, Name = "Free Waffle Cheesy Egg (B8)", Description = "Redeem for a free Waffle Cheesy Egg (B8)", PointsCost = 100, IsActive = true },
            new Reward { Id = 7, Name = "Free Spam, Egg, Rice (B12)", Description = "Redeem for a free Spam, Egg, Rice (B12)", PointsCost = 120, IsActive = true },
            new Reward { Id = 8, Name = "Free Mediano Frappe", Description = "Redeem for a free any mediano frappe", PointsCost = 140, IsActive = true },
            new Reward { Id = 9, Name = "Free B1 or B2", Description = "Redeem for a free B1 or B2", PointsCost = 160, IsActive = true },
            new Reward { Id = 10, Name = "Free All Day Breakfast + Americano", Description = "Redeem for a free All Day Breakfast of your choice plus a mediano hot/iced americano", PointsCost = 200, IsActive = true }
        );
    }
}