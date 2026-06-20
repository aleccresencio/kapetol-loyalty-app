using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CafeLoyaltyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RewardsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RewardsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRewards()
    {
        var rewards = await _context.Rewards
            .Where(r => r.IsActive)
            .OrderBy(r => r.PointsCost)
            .ToListAsync();

        return Ok(rewards);
    }
}
