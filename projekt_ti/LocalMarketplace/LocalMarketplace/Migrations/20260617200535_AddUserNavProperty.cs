using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalMarketplace.Migrations
{
    /// <inheritdoc />
    public partial class AddUserNavProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Advertisements_UserId",
                table: "Advertisements",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Advertisements_Users_UserId",
                table: "Advertisements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Advertisements_Users_UserId",
                table: "Advertisements");

            migrationBuilder.DropIndex(
                name: "IX_Advertisements_UserId",
                table: "Advertisements");
        }
    }
}
