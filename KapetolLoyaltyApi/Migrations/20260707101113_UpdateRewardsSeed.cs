using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KapetolLoyaltyApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRewardsSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free pastry of your choice", "Free Pastry", 10 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free mediano iced tea", "Free Mediano Iced Tea", 30 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free mediano americano", "Free Mediano Americano", 50 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free mediano coffee or frappe", "Free Mediano Coffee/Frappe", 70 });

            migrationBuilder.InsertData(
                table: "Rewards",
                columns: new[] { "Id", "Description", "IsActive", "Name", "PointsCost" },
                values: new object[] { 5, "Redeem for a free all-day breakfast meal", true, "Free All-day Breakfast Meal", 100 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free cup of coffee", "Free Coffee", 50 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free pastry of your choice", "Free Pastry", 80 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free meal set", "Free Meal", 150 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Get 10% off your next order", "10% Discount", 30 });
        }
    }
}
