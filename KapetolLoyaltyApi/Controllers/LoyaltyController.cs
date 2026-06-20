using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;

namespace CafeLoyaltyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoyaltyController : ControllerBase
{

    private readonly ILogger<LoyaltyController> _logger;
    private readonly AppDbContext _context;

    public LoyaltyController(ILogger<LoyaltyController> logger, AppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

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
            CreatedAt = DateTime.UtcNow
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

    [HttpPost("scan")]
    public async Task<IActionResult> ScanQr([FromBody] ScanQrRequest request)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.QRCodeId == request.QrCodeId);

        if (customer == null)
            return NotFound("Customer not found");

        // Calculate points
        int pointsToAdd = (int)(request.TotalSpent / 100);

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
            CreatedAt = DateTime.UtcNow
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
