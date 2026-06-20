using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<PointsLedger> PointsLedger { get; set; }
    public DbSet<Reward> Rewards { get; set; }
}