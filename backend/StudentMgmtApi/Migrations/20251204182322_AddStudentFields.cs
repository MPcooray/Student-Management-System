using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op migration to record the current database state.
            // The database already contains the expected tables (created earlier by EnsureCreated).
            // This empty Up prevents attempting to recreate existing objects when applying the migration.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op Down. Reversing this baseline migration is not supported because
            // the tables were not created by this migration.
        }
    }
}
