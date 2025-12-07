using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentMgmtApi.Data;
using StudentMgmtApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace StudentMgmtApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public StudentsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var students = await _db.Students
                .Include(s => s.Enrollments)
                .ThenInclude(e => e.Course)
                .ToListAsync();
            
            // Return DTO to avoid circular reference
            var dtos = students.Select(s => new StudentDto
            {
                Id = s.Id,
                FirstName = s.FirstName,
                LastName = s.LastName,
                Email = s.Email,
                Phone = s.Phone,
                DateOfBirth = s.DateOfBirth,
                Address = s.Address,
                Gender = s.Gender,
                Role = s.Role,
                Enrollments = s.Enrollments.Select(e => new EnrollmentDto 
                { 
                    CourseId = e.CourseId, 
                    Name = e.Course?.Name, 
                    Code = e.Course?.Code 
                }).ToList()
            }).ToList();
            
            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var student = await _db.Students
                .Include(s => s.Enrollments)
                .ThenInclude(e => e.Course)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null) return NotFound();
            
            // Return DTO to avoid circular reference
            var dto = new StudentDto
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                Email = student.Email,
                Phone = student.Phone,
                DateOfBirth = student.DateOfBirth,
                Address = student.Address,
                Gender = student.Gender,
                Role = student.Role,
                Enrollments = student.Enrollments.Select(e => new EnrollmentDto 
                { 
                    CourseId = e.CourseId, 
                    Name = e.Course?.Name, 
                    Code = e.Course?.Code 
                }).ToList()
            };
            
            return Ok(dto);
        }

        // Admin creates a new student with an initial password
        [HttpPost]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Create([FromBody] CreateStudentDto dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { message = "Not authenticated" });

            // Check if user is Admin
            var isAdmin = User.IsInRole("Admin") || User.Claims.Any(c => (c.Type == "role" || c.Type == ClaimTypes.Role) && c.Value == "Admin");
            if (!isAdmin)
                return Forbid();

            if (dto == null) return BadRequest("Payload required");
            if (string.IsNullOrWhiteSpace(dto.Email)) return BadRequest("Email is required");
            if (string.IsNullOrWhiteSpace(dto.Password)) return BadRequest("Password is required");

            // enforce email uniqueness
            var exists = await _db.Students.AnyAsync(s => s.Email == dto.Email);
            if (exists) return Conflict(new { message = "Email already exists" });

            var student = new Student
            {
                FirstName = dto.FirstName?.Trim() ?? string.Empty,
                LastName = dto.LastName?.Trim() ?? string.Empty,
                Email = dto.Email.Trim(),
                Phone = dto.Phone,
                Address = dto.Address,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Role = "Student",
                CreatedAt = DateTime.UtcNow,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _db.Students.Add(student);
            await _db.SaveChangesAsync();

            // Enroll in selected courses if provided
            if (dto.CourseIds != null && dto.CourseIds.Length > 0)
            {
                foreach (var cid in dto.CourseIds)
                {
                    _db.Enrollments.Add(new Enrollment { StudentId = student.Id, CourseId = cid });
                }
                await _db.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(Get), new { id = student.Id }, student);
        }

        // Enroll a student in multiple courses (body: { courseIds: [1,2,3] })
        [HttpPost("{id:int}/enroll")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Enroll(int id, [FromBody] int[] courseIds)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized();

            var student = await _db.Students.FindAsync(id);
            if (student == null) return NotFound();

            // Only allow the student themself or an Admin to modify enrollments.
            var isAdmin = User.IsInRole("Admin") || User.Claims.Any(c => (c.Type == "role" || c.Type == ClaimTypes.Role) && c.Value == "Admin");
            if (!isAdmin)
            {
                // Try multiple claim types to find the user ID
                var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
                       
                if (string.IsNullOrEmpty(sub) || !int.TryParse(sub, out var userId) || userId != id)
                {
                    return Forbid();
                }
            }

            // normalize input
            var desired = (courseIds ?? Array.Empty<int>()).ToHashSet();

            // load existing enrollments for this student
            var existing = await _db.Enrollments.Where(e => e.StudentId == id).ToListAsync();
            var existingCourseIds = existing.Select(e => e.CourseId).ToHashSet();

            // compute enrollments to remove (present but not desired)
            var toRemove = existing.Where(e => !desired.Contains(e.CourseId)).ToList();
            if (toRemove.Any()) _db.Enrollments.RemoveRange(toRemove);

            // compute course ids to add (desired but not present)
            var toAdd = desired.Except(existingCourseIds);
            foreach (var cid in toAdd)
            {
                _db.Enrollments.Add(new Enrollment { StudentId = id, CourseId = cid });
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var student = await _db.Students.FindAsync(id);
            if (student == null) return NotFound();

            // remove related enrollments first
            var enrollments = _db.Enrollments.Where(e => e.StudentId == id);
            _db.Enrollments.RemoveRange(enrollments);

            _db.Students.Remove(student);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Update a student's profile (only the student themself or an Admin)
        [HttpPut("{id:int}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentDto dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized();

            var student = await _db.Students.FindAsync(id);
            if (student == null) return NotFound();

            // Only allow the student themself or an Admin to update
            var isAdmin = User.IsInRole("Admin") || User.Claims.Any(c => (c.Type == "role" || c.Type == ClaimTypes.Role) && c.Value == "Admin");
            if (!isAdmin)
            {
                // Try multiple claim types to find the user ID
                var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;
                       
                if (string.IsNullOrEmpty(sub))
                {
                    return Unauthorized();
                }
                
                if (!int.TryParse(sub, out var userId))
                {
                    return Unauthorized();
                }
                
                if (userId != id)
                {
                    return Forbid();
                }
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.FirstName))
                return BadRequest(new { message = "First name is required." });
            if (string.IsNullOrWhiteSpace(dto.LastName))
                return BadRequest(new { message = "Last name is required." });

            // Update allowed fields
            student.FirstName = dto.FirstName;
            student.LastName = dto.LastName;
            student.Phone = dto.Phone;
            student.Address = dto.Address;
            student.DateOfBirth = dto.DateOfBirth;
            student.Gender = dto.Gender;

            _db.Students.Update(student);
            await _db.SaveChangesAsync();
            return Ok(new { student.Id, student.Email, student.FirstName, student.LastName, student.Phone, student.Address, student.DateOfBirth, student.Gender, student.Role });
        }
    }

    public class UpdateStudentDto
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
    }

    public class CreateStudentDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public int[]? CourseIds { get; set; }
    }

    public class StudentDto
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public string? Role { get; set; }
        public List<EnrollmentDto>? Enrollments { get; set; }
    }

    public class EnrollmentDto
    {
        public int CourseId { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
    }
}
