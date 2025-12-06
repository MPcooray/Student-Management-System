using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentMgmtApi.Data;
using StudentMgmtApi.Models;

namespace StudentMgmtApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CoursesController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.Courses.ToListAsync());

        [HttpPost]
        [Microsoft.AspNetCore.Authorization.Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] Course course)
        {
            _db.Courses.Add(course);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = course.Id }, course);
        }

        [HttpDelete("{id:int}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            // remove enrollments that reference this course
            var enrollments = _db.Enrollments.Where(e => e.CourseId == id);
            _db.Enrollments.RemoveRange(enrollments);

            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
