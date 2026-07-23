using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KapetolLoyaltyApi.Migrations
{
    /// <inheritdoc />
    public partial class RenameB1B2Reward : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Redeem for a free Bacon, Egg, and Rice Meal (B1) or Sausage, Egg, and Rice Meal (B2)", "Free Bacon, Egg, and Rice Meal (B1) or Sausage, Egg, and Rice Meal (B2)" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Rewards",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Redeem for a free B1 or B2", "Free B1 or B2" });
        }
    }
}
