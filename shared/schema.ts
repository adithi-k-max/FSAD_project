import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const userRoles = ["admin", "student", "employer", "officer"] as const;
export type UserRole = (typeof userRoles)[number];

export const applicationStatuses = ["applied", "shortlisted", "selected", "rejected"] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Users table (All roles)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: userRoles }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),  // Now unique and validated
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Profile
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  department: text("department"),
  cgpa: text("cgpa"), // Using text to avoid float precision issues, or can use decimal
  graduationYear: integer("graduation_year"),
  resumeUrl: text("resume_url"),
});

// Employer Profile
export const employers = pgTable("employers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  website: text("website"),
  isApproved: boolean("is_approved").default(false),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  location: text("location").notNull(),
  salary: text("salary").notNull(),
  postedAt: timestamp("posted_at").defaultNow(),
});

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  status: text("status", { enum: applicationStatuses }).default("applied").notNull(),
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  employer: one(employers, {
    fields: [users.id],
    references: [employers.userId],
  }),
  jobs: many(jobs), // If employer
  applications: many(applications), // If student
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

// Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    password: passwordSchema,
    email: z.string().email("Invalid email address"),
  });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertEmployerSchema = createInsertSchema(employers).omit({ id: true, isApproved: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, postedAt: true });
export const insertApplicationSchema = createInsertSchema(applications)
  .omit({ id: true, appliedAt: true, status: true });

export const updateApplicationStatusSchema = z.object({
  status: z.enum(applicationStatuses),
});

// Types
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
