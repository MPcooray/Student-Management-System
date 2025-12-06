using Microsoft.EntityFrameworkCore;
using StudentMgmtApi.Data;
using StudentMgmtApi.Models;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

// Configure JWT authentication
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection.GetValue<string>("Key") ?? "please-change-this-secret-in-production";
var jwtIssuer = jwtSection.GetValue<string>("Issuer") ?? "StudentMgmtApi";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "Admin"));
});

// CORS for the React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
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
    // Seed a default admin user if none exists (development convenience)
    try
    {
        if (!db.Students.Any(s => s.Role == "Admin"))
        {
            var admin = new Student
            {
                FirstName = "Site",
                LastName = "Admin",
                Email = "admin@school.local",
                Phone = "000-000-0000",
                DateOfBirth = DateTime.UtcNow.AddYears(-30),
                Address = "",
                Role = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
            };
            db.Students.Add(admin);
            db.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        // Swallow exceptions during seeding to avoid crashing the app in development.
        Console.WriteLine($"Admin seeding failed: {ex.Message}");
    }
}

// Use CORS
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
