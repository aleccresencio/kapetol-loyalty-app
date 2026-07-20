using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CafeLoyaltyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetHistory([FromQuery] int skip = 0, [FromQuery] int take = 25)
    {
        skip = Math.Max(skip, 0);
        take = Math.Clamp(take, 1, 50);

        var query = _context.PointsLedger
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip(skip)
            .Take(take)
            .Select(p => new
            {
                p.Id,
                p.CustomerId,
                CustomerName = p.Customer.Name,
                CustomerPhone = p.Customer.Phone,
                p.Points,
                p.Reason,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Items = items,
            TotalCount = totalCount,
            HasMore = skip + items.Count < totalCount
        });
    }
}
