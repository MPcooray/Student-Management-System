using Microsoft.EntityFrameworkCore;
using StudentMgmtApi.Data;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        // Prevent circular reference errors when serializing EF Core navigation properties
        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Database (reads connection string from appsettings.json -> "DefaultConnection")
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS for the React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// NOTE: Swagger / OpenAPI is DISABLED here to avoid assembly conflicts.
// You can re-enable it later after we ensure package versions are compatible.

var app = builder.Build();

// Ensure the database is created from EF models. Do NOT delete the DB on startup
// so development data persists between runs. Use EF Migrations to evolve schema.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Create the database if it doesn't exist. For schema changes, use EF Core
    // migrations (`dotnet ef migrations add <Name>` + `dotnet ef database update`).
    db.Database.EnsureCreated();
}

// Use CORS
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
