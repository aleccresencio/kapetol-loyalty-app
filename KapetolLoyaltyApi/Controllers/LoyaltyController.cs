using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;

namespace CafeLoyaltyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoyaltyController : ControllerBase
{

    private static readonly TimeZoneInfo PhilippineTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

    private readonly ILogger<LoyaltyController> _logger;
    private readonly AppDbContext _context;

    public LoyaltyController(ILogger<LoyaltyController> logger, AppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    private static DateTime PhilippineNow() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, PhilippineTimeZone);

    [HttpPost("redeem")]
    public async Task<IActionResult> RedeemReward([FromBody] RedeemRequest request)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.QRCodeId == request.QrCodeId);

        if (customer == null)
            return NotFound("Customer not found");

        var reward = await _context.Rewards.FindAsync(request.RewardId);

        if (reward == null || !reward.IsActive)
            return NotFound("Reward not found");

        var totalPoints = await _context.PointsLedger
            .Where(p => p.CustomerId == customer.Id)
            .SumAsync(p => p.Points);

        if (totalPoints < reward.PointsCost)
            return BadRequest("Insufficient points");

        var entry = new PointsLedger
        {
            CustomerId = customer.Id,
            Points = -reward.PointsCost,
            Reason = $"Reward: {reward.Name}",
            CreatedAt = PhilippineNow()
        };

        _context.PointsLedger.Add(entry);
        await _context.SaveChangesAsync();

        var updatedPoints = totalPoints - reward.PointsCost;

        return Ok(new
        {
            customer.Name,
            RewardName = reward.Name,
            PointsDeducted = reward.PointsCost,
            TotalPoints = updatedPoints
        });
    }

    [HttpGet("redeem-qrcode")]
    public async Task<IActionResult> GenerateRedemptionQrCode([FromQuery] string qrCodeId, [FromQuery] int rewardId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.QRCodeId == qrCodeId);
        if (customer == null)
            return NotFound("Customer not found");

        var reward = await _context.Rewards.FindAsync(rewardId);
        if (reward == null || !reward.IsActive)
            return NotFound("Reward not found");

        using var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode($"REDEEM:{qrCodeId}:{rewardId}", QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrData);
        byte[] qrBytes = qrCode.GetGraphic(20);

        return File(qrBytes, "image/png");
    }

    [HttpPost("scan")]
    public async Task<IActionResult> ScanQr([FromBody] ScanQrRequest request)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.QRCodeId == request.QrCodeId);

        if (customer == null)
            return NotFound("Customer not found");

        // Calculate points
        int pointsToAdd = (int)(request.TotalSpent / 50);

        if (pointsToAdd <= 0)
        {
            return BadRequest("Total spent is too low to earn points");
        }

        // Create ledger entry
        var entry = new PointsLedger
        {
            CustomerId = customer.Id,
            Points = pointsToAdd,
            Reason = $"Purchase worth ₱{request.TotalSpent}",
            CreatedAt = PhilippineNow()
        };

        _context.PointsLedger.Add(entry);

        await _context.SaveChangesAsync();

        // Calculate total points
        var totalPoints = await _context.PointsLedger
            .Where(p => p.CustomerId == customer.Id)
            .SumAsync(p => p.Points);

        return Ok(new
        {
            customer.Id,
            customer.Name,
            TotalSpent = request.TotalSpent,
            PointsEarned = pointsToAdd,
            TotalPoints = totalPoints
        });
    }
}
