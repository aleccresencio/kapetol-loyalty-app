using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;

namespace CafeLoyaltyApi.Controllers;

[ApiController]
[Route("[controller]")]
public class CustomersController : ControllerBase
{

    private readonly ILogger<CustomersController> _logger;
    private readonly AppDbContext _context;

    public CustomersController(ILogger<CustomersController> logger, AppDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer(CreateCustomerRequest request)
    {
        var customer = new Customer
        {
            Name = request.Name,
            Phone = request.Phone,
            QRCodeId = Guid.NewGuid().ToString(),
            CreatedAt = DateTime.Now
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return Ok(customer);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        return Ok(customer);
    }

    [HttpPost("{id}/points")]
    public async Task<IActionResult> AddPoints(int id, int points, string reason)
    {
        var ledger = new PointsLedger
        {
            CustomerId = id,
            Points = points,
            Reason = reason,
            CreatedAt = DateTime.Now
        };

        _context.PointsLedger.Add(ledger);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("{id}/qrcode")]
    public async Task<IActionResult> GenerateQrCode(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
            return NotFound();

        using var qrGenerator = new QRCodeGenerator();

        var qrData = qrGenerator.CreateQrCode(
            customer.QRCodeId,
            QRCodeGenerator.ECCLevel.Q);

        var qrCode = new PngByteQRCode(qrData);

        byte[] qrBytes = qrCode.GetGraphic(20);

        return File(qrBytes, "image/png");
    }

    [HttpGet("by-phone/{phone}")]
    public async Task<IActionResult> GetCustomerByPhone(string phone)
    {
        var customer = await _context.Customers
            .Where(c => c.Phone == phone)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Phone,
                c.QRCodeId,
                TotalPoints = _context.PointsLedger
                    .Where(p => p.CustomerId == c.Id)
                    .Sum(p => p.Points)
            }).FirstOrDefaultAsync();

        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpGet("by-qr/{qrCodeId}")]
    public async Task<IActionResult> GetCustomerByQr(string qrCodeId)
    {
        var customer = await _context.Customers
            .Where(c => c.QRCodeId == qrCodeId)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Phone,
                c.QRCodeId
            }).FirstOrDefaultAsync();

        if (customer == null)
            return NotFound();

        return Ok(customer);
    }
}
