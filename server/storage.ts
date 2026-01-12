import { users, students, employers, jobs, applications, type User, type Student, type Employer, type Job, type Application, type InsertUser, type InsertStudent, type InsertEmployer, type InsertJob, type InsertApplication } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profiles
  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(userId: number): Promise<Student | undefined>;
  createEmployer(employer: InsertEmployer): Promise<Employer>;
  getEmployer(userId: number): Promise<Employer | undefined>;
  approveEmployer(id: number): Promise<Employer | undefined>;
  getAllEmployers(): Promise<Employer[]>;
  getAllStudents(): Promise<Student[]>;

  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getJobs(): Promise<(Job & { employer: User })[]>;
  getJobsByEmployer(employerId: number): Promise<Job[]>;
  
  // Applications
  createApplication(app: InsertApplication): Promise<Application>;
  getApplicationsByStudent(studentId: number): Promise<(Application & { job: Job, student: User })[]>;
  getApplicationsByJob(jobId: number): Promise<(Application & { job: Job, student: User })[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  getAllApplications(): Promise<Application[]>;

  // Stats
  getStats(): Promise<{ totalStudents: number; totalEmployers: number; totalJobs: number; placements: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async getStudent(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async createEmployer(employer: InsertEmployer): Promise<Employer> {
    const [newEmployer] = await db.insert(employers).values(employer).returning();
    return newEmployer;
  }

  async getEmployer(userId: number): Promise<Employer | undefined> {
    const [employer] = await db.select().from(employers).where(eq(employers.userId, userId));
    return employer;
  }

  async approveEmployer(id: number): Promise<Employer | undefined> {
    const [employer] = await db.update(employers)
      .set({ isApproved: true })
      .where(eq(employers.id, id))
      .returning();
    return employer;
  }

  async getAllEmployers(): Promise<Employer[]> {
    return await db.select().from(employers);
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobs(): Promise<(Job & { employer: User })[]> {
    const results = await db.select({
      job: jobs,
      employer: users
    })
    .from(jobs)
    .innerJoin(users, eq(jobs.employerId, users.id));
    
    return results.map(r => ({ ...r.job, employer: r.employer }));
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.employerId, employerId));
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(app).returning();
    return application;
  }

  async getApplicationsByStudent(studentId: number): Promise<(Application & { job: Job, student: User })[]> {
    const results = await db.select({
      application: applications,
      job: jobs,
      student: users
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(users, eq(applications.studentId, users.id))
    .where(eq(applications.studentId, studentId));

    return results.map(r => ({ ...r.application, job: r.job, student: r.student }));
  }

  async getApplicationsByJob(jobId: number): Promise<(Application & { job: Job, student: User })[]> {
    const results = await db.select({
      application: applications,
      job: jobs,
      student: users
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(users, eq(applications.studentId, users.id))
    .where(eq(applications.jobId, jobId));

    return results.map(r => ({ ...r.application, job: r.job, student: r.student }));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [app] = await db.update(applications)
      .set({ status: status as any })
      .where(eq(applications.id, id))
      .returning();
    return app;
  }

  async getStats(): Promise<{ totalStudents: number; totalEmployers: number; totalJobs: number; placements: number }> {
    const studentsCount = await db.select().from(students);
    const employersCount = await db.select().from(employers);
    const jobsCount = await db.select().from(jobs);
    const placementsCount = await db.select().from(applications).where(eq(applications.status, 'selected'));

    return {
      totalStudents: studentsCount.length,
      totalEmployers: employersCount.length,
      totalJobs: jobsCount.length,
      placements: placementsCount.length,
    };
  }
}

export const storage = new DatabaseStorage();
