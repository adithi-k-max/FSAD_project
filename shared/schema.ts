import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ===============================
   Constants
================================= */

export const userRoles = ["admin", "student", "employer", "officer"] as const;
export type UserRole = (typeof userRoles)[number];

export const applicationStatuses = [
  "applied",
  "shortlisted",
  "selected",
  "rejected",
] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

/* ===============================
   Password Validation
================================= */

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/* ===============================
   Tables
================================= */

// USERS (All roles)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  username: text("username").notNull().unique(),
  password: text("password").notNull(),

  role: text("role").notNull(),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

// STUDENTS
export const students = sqliteTable("students", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),

  department: text("department"),
  cgpa: text("cgpa"),
  graduationYear: integer("graduation_year"),
  resumeUrl: text("resume_url"),
});

// EMPLOYERS
export const employers = sqliteTable("employers", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),

  companyName: text("company_name").notNull(),
  industry: text("industry"),
  website: text("website"),

  isApproved: integer("is_approved", { mode: "boolean" })
    .notNull()
    .default(false),
});

// JOBS
export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  employerId: integer("employer_id")
    .notNull()
    .references(() => users.id),

  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  location: text("location").notNull(),
  salary: text("salary").notNull(),

  postedAt: integer("posted_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

// APPLICATIONS
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id),

  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),

  status: text("status").notNull().default("applied"),

  appliedAt: integer("applied_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

/* ===============================
   Relations
================================= */

export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),

  employer: one(employers, {
    fields: [users.id],
    references: [employers.userId],
  }),

  jobs: many(jobs),
  applications: many(applications),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  employer: one(users, {
    fields: [jobs.employerId],
    references: [users.id],
  }),

  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),

  student: one(users, {
    fields: [applications.studentId],
    references: [users.id],
  }),
}));

/* ===============================
   Zod Schemas
================================= */

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    password: passwordSchema,
    email: z.string().email("Invalid email address"),
  });

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertEmployerSchema = createInsertSchema(employers).omit({
  id: true,
  isApproved: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  status: true,
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(applicationStatuses),
});

/* ===============================
   Types
================================= */

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Employer = typeof employers.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;