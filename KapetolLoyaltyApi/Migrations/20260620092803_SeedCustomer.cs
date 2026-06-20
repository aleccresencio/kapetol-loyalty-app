using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KapetolLoyaltyApi.Migrations
{
    /// <inheritdoc />
    public partial class SeedCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "CreatedAt", "Name", "Phone", "QRCodeId" },
                values: new object[] { 1, new DateTime(2026, 6, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Alec Cresencio", "09279179977", "5c0ad0f3-da3f-4885-9037-b276bb68a7c1" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
