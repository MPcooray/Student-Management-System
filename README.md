# Student Management System

Full-stack web application for managing student registrations, course enrollments, and role-based access control. Built with ASP.NET Core 9 (.NET 9) backend and React 18 + Vite frontend.

## 📋 Project Overview

This system allows:
- **Students** to register, log in, manage their profile, and enroll in courses
- **Administrators** to create students with passwords, manage courses, and view all enrollments
- **Secure authentication** via JWT tokens with role-based authorization (Admin/Student)
- **Modern UI** with Tailwind CSS, responsive design, and real-time updates

## 🚀 Features

### Authentication & Authorization
- Student registration with email/password (hashed with BCrypt)
- JWT-based authentication with 7-day token expiration
- Role-based access control (Admin vs Student)
- Protected API endpoints and frontend routes
- Admin seeding for development (email: `admin@school.local`, password: `Admin123!`)

### Student Management
- Admin can create students with initial passwords
- Students can register themselves
- Students can update their profile (name, phone, address, DOB, gender)
- Email uniqueness validation
- Age validation (students must be 17+)

### Course & Enrollment Management
- Admins can create and delete courses
- Students can enroll in multiple courses via dashboard
- Many-to-many relationship (Student ↔ Enrollment ↔ Course)
- Enrollment tracking with timestamps

### UI/UX
- Responsive design with Tailwind CSS
- Dashboard with overview cards (students, courses, enrollments)
- Student dashboard with profile editing and course enrollment
- Admin dashboard for managing students and courses
- Toast notifications for user feedback
- Consistent styling and branding

## 🛠️ Tech Stack

### Backend
- **Framework**: ASP.NET Core 9 Web API
- **Database**: SQL Server 
- **ORM**: Entity Framework Core 9
- **Authentication**: JWT Bearer tokens
- **Password Hashing**: BCrypt.Net
- **JSON Serialization**: System.Text.Json with circular reference handling

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with JWT interceptor
- **State Management**: Context API + localStorage

## 📦 Prerequisites

- **.NET 9 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **SQL Server** (SQL Server Express, LocalDB, or Docker container)

## 🔧 Setup & Installation

### 1. Database Setup

**Option A: SQL Server Express (Recommended for Windows)**
```bash
# Install SQL Server Express from Microsoft website
# Connection string in appsettings.json uses localhost,1433
```

**Option B: Docker (Cross-platform)**
```bash
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=StrongPassword123!' \
  -p 1433:1433 --name student-sql -d \
  mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Backend Setup

```bash
cd backend/StudentMgmtApi

# Restore dependencies
dotnet restore

# Apply database migrations
dotnet ef database update

# Build the project
dotnet build

# Run the API (development mode)
dotnet run
```

The API will start on `http://localhost:5269`

**Environment Configuration** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=StudentMgmt;User Id=sa;Password=StrongPassword123!;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "please-change-this-secret-in-production",
    "Issuer": "StudentMgmtApi"
  }
}
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or next available port)

**Environment Configuration** (`.env` - optional):
```env
VITE_API_URL=http://localhost:5269/api
```

## 🎯 Usage

### Default Admin Account
- **Email**: `admin@school.local`
- **Password**: `Admin123!`

### Student Self-Registration
1. Navigate to `http://localhost:5173/register`
2. Fill in the registration form (all students are auto-assigned "Student" role)
3. After registration, log in at `/login`
4. Access your dashboard at `/student-dashboard`

### Admin Workflow
1. Log in as Admin
2. Navigate to **Students** → **New Student** to create students with passwords
3. Navigate to **Courses** to create/delete courses
4. View dashboard for system overview

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login and get JWT token

### Students (Protected)
- `GET /api/students` - Get all students (Admin only displays in UI)
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/{id}` - Update student profile (Own profile or Admin)
- `DELETE /api/students/{id}` - Delete student
- `POST /api/students/{id}/enroll` - Enroll student in courses (Own enrollment or Admin)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin only)
- `DELETE /api/courses/{id}` - Delete course (Admin only)

## 🗂️ Database Schema

### Students Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Auto-increment |
| FirstName | nvarchar(max) | |
| LastName | nvarchar(max) | |
| Email | nvarchar(450) | Unique (enforced in code) |
| PasswordHash | nvarchar(max) | BCrypt hashed |
| Phone | nvarchar(max) | Nullable |
| Address | nvarchar(max) | Nullable |
| DateOfBirth | datetime2 | Nullable |
| Gender | nvarchar(max) | Nullable |
| Role | nvarchar(max) | Default: "Student" |
| Age | int | Nullable |
| CreatedAt | datetime2 | Default: GETUTCDATE() |

### Courses Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Auto-increment |
| Code | nvarchar(max) | |
| Name | nvarchar(max) | |
| Credits | int | Default: 3 |

### Enrollments Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Auto-increment |
| StudentId | int | Foreign Key → Students(Id) |
| CourseId | int | Foreign Key → Courses(Id) |
| EnrolledAt | datetime2 | Default: GETUTCDATE() |

## 🧪 Testing

### Manual Testing Workflow
1. **Admin Login**: Use `admin@school.local` / `Admin123!`
2. **Create Course**: Go to Courses → Add new course
3. **Create Student**: Go to Students → New Student (provide email + password)
4. **Student Login**: Log out, log in as the created student
5. **Enroll**: Go to Student Dashboard → Select courses → Save Enrollments
6. **Verify**: Admin can see enrollments in Students list

### API Testing with curl
```bash
# Login as admin
curl -X POST http://localhost:5269/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.local","password":"Admin123!"}'

# Get all courses
curl http://localhost:5269/api/courses

# Create student (requires admin token)
curl -X POST http://localhost:5269/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"Test123!"}'
```







