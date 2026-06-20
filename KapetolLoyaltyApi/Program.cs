using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    }); builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200",
                    "capacitor://localhost",
                    "http://localhost")
              .AllowAnyHeader()
              .AllowAnyMethod();
        });
});

var app = builder.Build();

// Create Rewards table and seed data if it doesn't exist yet
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Rewards' AND xtype='U')
        BEGIN
            CREATE TABLE Rewards (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(MAX) NOT NULL,
                Description NVARCHAR(MAX) NOT NULL,
                PointsCost INT NOT NULL,
                IsActive BIT NOT NULL DEFAULT 1
            );
            INSERT INTO Rewards (Name, Description, PointsCost, IsActive) VALUES
                ('Free Coffee', 'Redeem for a free cup of coffee', 50, 1),
                ('Free Pastry', 'Redeem for a free pastry of your choice', 80, 1),
                ('Free Meal', 'Redeem for a free meal set', 150, 1),
                ('10% Discount', 'Get 10% off your next order', 30, 1);
        END
    ");
}

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAngular");
app.MapControllers();

app.Run();