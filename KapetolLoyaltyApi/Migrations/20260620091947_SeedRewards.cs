using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KapetolLoyaltyApi.Migrations
{
    /// <inheritdoc />
    public partial class SeedRewards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Rewards",
                columns: new[] { "Id", "Description", "IsActive", "Name", "PointsCost" },
                values: new object[,]
                {
                    { 1, "Redeem for a free cup of coffee", true, "Free Coffee", 50 },
                    { 2, "Redeem for a free pastry of your choice", true, "Free Pastry", 80 },
                    { 3, "Redeem for a free meal set", true, "Free Meal", 150 },
                    { 4, "Get 10% off your next order", true, "10% Discount", 30 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
