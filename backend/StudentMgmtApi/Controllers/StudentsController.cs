using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentMgmtApi.Data;
using StudentMgmtApi.Models;

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
            return Ok(students);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var student = await _db.Students
                .Include(s => s.Enrollments)
                .ThenInclude(e => e.Course)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null) return NotFound();
            return Ok(student);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Student student)
        {
            _db.Students.Add(student);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = student.Id }, student);
        }

        // Enroll a student in multiple courses (body: { courseIds: [1,2,3] })
        [HttpPost("{id:int}/enroll")]
        public async Task<IActionResult> Enroll(int id, [FromBody] int[] courseIds)
        {
            var student = await _db.Students.FindAsync(id);
            if (student == null) return NotFound();

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
    }
}
