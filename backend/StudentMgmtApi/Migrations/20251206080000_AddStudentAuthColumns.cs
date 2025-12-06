using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentMgmtApi.Migrations
{
    public partial class AddStudentAuthColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Students",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Students",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Student");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Students");
        }
    }
}
