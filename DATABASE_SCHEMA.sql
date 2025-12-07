


-- TABLE: Students

CREATE TABLE [Students] (
    [Id] int NOT NULL IDENTITY,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [Email] nvarchar(450) NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [Role] nvarchar(max) NULL,
    [Age] int NULL,
    [DateOfBirth] datetime2 NULL,
    [Gender] nvarchar(max) NULL,
    [Phone] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Students] PRIMARY KEY ([Id]),
    CONSTRAINT [IX_Students_Email] UNIQUE ([Email])
);


-- TABLE: Courses

CREATE TABLE [Courses] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Code] nvarchar(max) NOT NULL,
    [Credits] int NOT NULL,
    CONSTRAINT [PK_Courses] PRIMARY KEY ([Id])
);


-- TABLE: Enrollments

CREATE TABLE [Enrollments] (
    [Id] int NOT NULL IDENTITY,
    [StudentId] int NOT NULL,
    [CourseId] int NOT NULL,
    [EnrolledAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Enrollments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Enrollments_Courses_CourseId] FOREIGN KEY ([CourseId]) 
        REFERENCES [Courses]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Enrollments_Students_StudentId] FOREIGN KEY ([StudentId]) 
        REFERENCES [Students]([Id]) ON DELETE CASCADE,
    CONSTRAINT [IX_Enrollments_StudentId_CourseId] UNIQUE ([StudentId], [CourseId])
);

-- INDEXES

CREATE INDEX [IX_Enrollments_CourseId] ON [Enrollments] ([CourseId]);
CREATE INDEX [IX_Enrollments_StudentId] ON [Enrollments] ([StudentId]);

