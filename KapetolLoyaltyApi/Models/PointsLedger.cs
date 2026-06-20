public class PointsLedger
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int Points { get; set; }
    public string Reason { get; set; }
    public DateTime CreatedAt { get; set; }

    public Customer Customer { get; set; }
}