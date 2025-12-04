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

            foreach (var cid in courseIds)
            {
                // skip if already enrolled
                bool exists = await _db.Enrollments.AnyAsync(e => e.StudentId == id && e.CourseId == cid);
                if (exists) continue;

                _db.Enrollments.Add(new Enrollment { StudentId = id, CourseId = cid });
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
