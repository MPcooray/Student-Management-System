using System;

namespace StudentMgmtApi.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        // Hashed password for authentication (nullable until DB updated)
        public string? PasswordHash { get; set; }
        // Role for simple RBAC (e.g. "Student", "Admin")
        public string? Role { get; set; } = "Student";
        public int? Age { get; set; }

        // Optional profile fields
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }

        // Auditing
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}
