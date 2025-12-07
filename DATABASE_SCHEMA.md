# Student Management System - Database Schema

## Overview
The Student Management System uses SQL Server with Entity Framework Core 9.0. The database consists of three main tables: `Students`, `Courses`, and `Enrollments`.

---

## Table Schemas

### 1. Students Table
Stores user information and authentication data.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **Id** | int | PRIMARY KEY, IDENTITY | Unique identifier (auto-incremented) |
| **FirstName** | nvarchar(max) | NOT NULL | Student's first name |
| **LastName** | nvarchar(max) | NOT NULL | Student's last name |
| **Email** | nvarchar(450) | NOT NULL, UNIQUE | Unique email address for login |
| **PasswordHash** | nvarchar(max) | NULL | BCrypt hashed password |
| **Role** | nvarchar(max) | NULL | User role: 'Student' or 'Admin' |
| **Age** | int | NULL | Student's age |
| **DateOfBirth** | datetime2 | NULL | Student's date of birth |
| **Gender** | nvarchar(max) | NULL | Student's gender |
| **Phone** | nvarchar(max) | NULL | Contact phone number |
| **Address** | nvarchar(max) | NULL | Home address |
| **CreatedAt** | datetime2 | NOT NULL | Account creation timestamp (UTC) |

**Indexes:**
- Primary Key: `Id`
- Unique Index: `Email` (enforces unique email per user)

---

### 2. Courses Table
Stores course/subject information.

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **Id** | int | PRIMARY KEY, IDENTITY | Unique course identifier (auto-incremented) |
| **Name** | nvarchar(max) | NOT NULL | Course name (e.g., "Parallel Computing") |
| **Code** | nvarchar(max) | NOT NULL | Course code (e.g., "PC2025") |
| **Credits** | int | NOT NULL | Credit hours for the course |

**Indexes:**
- Primary Key: `Id`

---

### 3. Enrollments Table
Junction table linking students to courses (many-to-many relationship).

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **Id** | int | PRIMARY KEY, IDENTITY | Unique enrollment record ID |
| **StudentId** | int | FOREIGN KEY (Students.Id) | Reference to student |
| **CourseId** | int | FOREIGN KEY (Courses.Id) | Reference to course |
| **EnrolledAt** | datetime2 | NOT NULL | Enrollment date/time (UTC) |

**Indexes:**
- Primary Key: `Id`
- Unique Index: `(StudentId, CourseId)` — prevents duplicate enrollments
- Foreign Key Index: `CourseId`
- Foreign Key Index: `StudentId`

**Relationships:**
- `StudentId` → `Students.Id` (ON DELETE CASCADE)
- `CourseId` → `Courses.Id` (ON DELETE CASCADE)

---

## Entity Relationships

```
Students (1) ──────< (Many) Enrollments >──────(1) Courses
```

- A **Student** can have multiple **Enrollments**
- A **Course** can have multiple **Enrollments**
- An **Enrollment** ties one Student to one Course

---

## Default Data

### Admin Account
A default admin account is automatically created on first run:
- **Email:** `admin@school.local`
- **Password:** `Admin123!`
- **Role:** `Admin`

---

## Authentication & Authorization

- **Password Storage:** Passwords are hashed using BCrypt (salted)
- **JWT Tokens:** Admin users receive JWT tokens with role claim
- **Admin Policy:** Course creation/deletion requires `Role = 'Admin'`
- **Role Types:**
  - `Admin` – Can create and delete courses, manage students
  - `Student` – Default role, can enroll in courses

---

## Constraints & Business Rules

1. **Email Uniqueness:** Each student must have a unique email address
2. **Unique Enrollments:** A student cannot enroll in the same course twice (composite unique index)
3. **Cascade Delete:** 
   - Deleting a Student removes all their Enrollments
   - Deleting a Course removes all its Enrollments
4. **Required Fields:**
   - Students: FirstName, LastName, Email (at creation)
   - Courses: Name, Code, Credits
   - Enrollments: StudentId, CourseId, EnrolledAt

---

## EF Core Configuration

The database is configured in `AppDbContext.cs`:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Student>()
        .HasIndex(s => s.Email)
        .IsUnique();

    modelBuilder.Entity<Enrollment>()
        .HasIndex(e => new { e.StudentId, e.CourseId })
        .IsUnique();
}
```

---

## Migrations

All schema changes are tracked via EF Core migrations located in `/backend/StudentMgmtApi/Migrations/`:

- `Initial` – Base tables created
- `AddStudentFields` – Added optional profile fields
- `AddStudentCreatedAt` – Added CreatedAt timestamp
- `AddStudentAuthColumns` – Added PasswordHash and Role

To apply migrations:
```bash
dotnet ef database update
```

---

## Database Connection

**Connection String** (from `appsettings.json`):
```
Server=localhost,1433;Database=StudentMgmt;User Id=sa;Password=StrongPassword123!;TrustServerCertificate=True;
```

**Database:** SQL Server (local instance)
**Port:** 1433

---

## Files for Submission

1. **DATABASE_SCHEMA.sql** – Complete SQL DDL for schema creation
2. **DATABASE_SCHEMA.md** – This documentation file
3. **AppDbContext.cs** – EF Core context configuration
4. **Migrations/** – Complete migration history

