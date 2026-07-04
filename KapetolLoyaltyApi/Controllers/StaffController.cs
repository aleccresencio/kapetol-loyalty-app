using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace CafeLoyaltyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public StaffController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("verify-pin")]
    public IActionResult VerifyPin([FromBody] VerifyPinRequest request)
    {
        var staffPin = _configuration["StaffPin"];

        if (request.Pin != staffPin)
            return Unauthorized();

        var secret = _configuration["StaffTokenSecret"] ?? string.Empty;
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(15);
        var payload = $"{Guid.NewGuid()}.{expiresAt.ToUnixTimeSeconds()}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var signature = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        var token = $"{payload}.{signature}";

        return Ok(new { Token = token, ExpiresAt = expiresAt });
    }
}
