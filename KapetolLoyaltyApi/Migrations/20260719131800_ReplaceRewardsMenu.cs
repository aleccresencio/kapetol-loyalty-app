using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KapetolLoyaltyApi.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceRewardsMenu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "10% discount on any drinks", "10% Discount on Drinks", 20 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Redeem for a free mediano hot or iced tea", "Free Mediano Hot/Iced Tea" });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free mediano hot or iced americano", "Free Mediano Hot/Iced Americano", 40 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "20% discount on any drinks", "20% Discount on Drinks", 60 });

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free waffle (B6)", "Free Waffle (B6)", 80 });

            migrationBuilder.InsertData(
                table: "Rewards",
                columns: new[] { "Id", "Description", "IsActive", "Name", "PointsCost" },
                values: new object[,]
                {
                    { 6, "Redeem for a free Waffle Cheesy Egg (B8)", true, "Free Waffle Cheesy Egg (B8)", 100 },
                    { 7, "Redeem for a free Spam, Egg, Rice (B12)", true, "Free Spam, Egg, Rice (B12)", 120 },
                    { 8, "Redeem for a free any mediano frappe", true, "Free Mediano Frappe", 140 },
                    { 9, "Redeem for a free B1 or B2", true, "Free B1 or B2", 160 },
                    { 10, "Redeem for a free All Day Breakfast of your choice plus a mediano hot/iced americano", true, "Free All Day Breakfast + Americano", 200 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 10);

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
                columns: new[] { "Description", "Name" },
                values: new object[] { "Redeem for a free mediano iced tea", "Free Mediano Iced Tea" });

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

            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "PointsCost" },
                values: new object[] { "Redeem for a free all-day breakfast meal", "Free All-day Breakfast Meal", 100 });
        }
    }
}
