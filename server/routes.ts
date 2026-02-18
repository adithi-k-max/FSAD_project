import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { updateApplicationStatusSchema, applicationStatuses } from "@shared/schema";
import { SESSION_CONFIG, HTTP_STATUS, ERROR_MESSAGES, USER_ROLES, EDIT_APPLICATION_ROLES } from "./constants";
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Use environment variable for session secret, with fallback only for development
  const sessionSecret = process.env.SESSION_SECRET || 
    (process.env.NODE_ENV === "production" 
      ? (() => { throw new Error("SESSION_SECRET must be set in production"); })()
      : "dev-secret-change-in-production");

  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: SESSION_CONFIG.MAX_AGE, secure: process.env.NODE_ENV === "production" },
      store: new SessionStore({ checkPeriod: SESSION_CONFIG.CHECK_PERIOD }),
    })
  );

  // Authentication Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Authorization middleware: Check user role
  const requireRole = (...allowedRoles: string[]) => 
    async (req: any, res: any, next: any) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      req.user = user;
      next();
    };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      // Create profile based on role
      if (input.role === "student" && input.studentDetails) {
        await storage.createStudent({
          ...input.studentDetails,
          userId: user.id,
        });
      } else if (input.role === "employer" && input.employerDetails) {
        await storage.createEmployer({
          ...input.employerDetails,
          userId: user.id,
        });
      }

      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    const input = api.auth.login.input.parse(req.body);
    const user = await storage.getUserByUsername(input.username);

    if (!user || !(await comparePassword(input.password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.status(200).json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Jobs Routes
  app.get(api.jobs.list.path, requireAuth, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.post(api.jobs.create.path, requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (user?.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }
    
    const input = api.jobs.create.input.parse(req.body);
    const job = await storage.createJob({
      ...input,
      employerId: user.id,
    });
    res.status(201).json(job);
  });

  app.get(api.jobs.get.path, requireAuth, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  // Applications Routes
  app.get(api.applications.list.path, requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    try {
      if (user.role === "student") {
        const apps = await storage.getApplicationsByStudent(user.id);
        return res.json(apps);
      } else if (user.role === "employer") {
        // Efficient single query instead of N+1
        const apps = await storage.getApplicationsByEmployer(user.id);
        return res.json(apps);
      } else if (user.role === "admin" || user.role === "officer") {
        const apps = await storage.getAllApplications();
        return res.json(apps);
      }
      res.json([]);
    } catch (err) {
      console.error("Error fetching applications:", err);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post(api.applications.create.path, requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (user?.role !== "student") {
      return res.status(403).json({ message: "Only students can apply" });
    }

    const input = api.applications.create.input.parse(req.body);
    // Check if already applied
    const existingApps = await storage.getApplicationsByStudent(user.id);
    const alreadyApplied = existingApps.find(a => a.job.id === input.jobId);
    if (alreadyApplied) {
        return res.status(400).json({ message: "Already applied to this job" });
    }

    const application = await storage.createApplication({
      jobId: input.jobId,
      studentId: user.id,
    });
    res.status(201).json(application);
  });

  app.patch(api.applications.updateStatus.path, requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || !["employer", "admin", "officer"].includes(user.role)) {
      return res.status(403).json({ message: "Only employers and admins can update applications" });
    }

    try {
      const input = updateApplicationStatusSchema.parse(req.body);
      
      // Authorization: Verify employer owns the job this application is for
      if (user.role === "employer") {
        const appId = Number(req.params.id);
        const application = await storage.getApplicationById(appId);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        const job = await storage.getJob(application.jobId);
        if (!job || job.employerId !== user.id) {
          return res.status(403).json({ message: "Cannot update applications for this job" });
        }
      }
      
      const updated = await storage.updateApplicationStatus(Number(req.params.id), input.status);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status value", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Stats
  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!["admin", "officer"].includes(user?.role || "")) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Auto-seed function with secure random passwords
  const seedDatabase = async () => {
    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      console.log("Seeding database with sample data...");
      
      // Generate secure random passwords for demo (should be changed immediately)
      const adminPassword = randomBytes(16).toString('hex');
      const employerPassword = randomBytes(16).toString('hex');
      const studentPassword = randomBytes(16).toString('hex');
      
      // Log passwords only in development - in production use env vars or secure auth
      if (process.env.NODE_ENV !== "production") {
        console.log("DEMO CREDENTIALS (for development only):");
        console.log(`Admin - username: admin - password: ${adminPassword}`);
        console.log(`Employers - password: ${employerPassword}`);
        console.log(`Students - password: ${studentPassword}`);
      }
      
      const hashedAdminPassword = await hashPassword(adminPassword);
      await storage.createUser({
        username: "admin",
        password: hashedAdminPassword,
        role: "admin",
        name: "System Admin",
        email: "admin@college.edu",
      });
      
      // Create Employers
      const empPass = await hashPassword(employerPassword);
      const employers = [];
      
      const employer1 = await storage.createUser({
        username: "techcorp",
        password: empPass,
        role: "employer",
        name: "Tech Corp HR",
        email: "hr@techcorp.com",
      });
      employers.push(employer1);
      await storage.createEmployer({
        userId: employer1.id,
        companyName: "Tech Corp",
        industry: "Software",
        website: "https://techcorp.com",
      });

      const employer2 = await storage.createUser({
        username: "innovateinc",
        password: empPass,
        role: "employer",
        name: "Innovate Inc HR",
        email: "hr@innovate.com",
      });
      employers.push(employer2);
      await storage.createEmployer({
        userId: employer2.id,
        companyName: "Innovate Inc",
        industry: "AI/ML",
        website: "https://innovate.com",
      });

      const employer3 = await storage.createUser({
        username: "globalenterprises",
        password: empPass,
        role: "employer",
        name: "Global Enterprises HR",
        email: "hr@globalenterprises.com",
      });
      employers.push(employer3);
      await storage.createEmployer({
        userId: employer3.id,
        companyName: "Global Enterprises",
        industry: "Consulting",
        website: "https://globalenterprises.com",
      });

      // Create Students
      const studentPass = await hashPassword(studentPassword);
      const students = [];

      const student1 = await storage.createUser({
        username: "alice",
        password: studentPass,
        role: "student",
        name: "Alice Smith",
        email: "alice@student.edu",
      });
      students.push(student1);
      await storage.createStudent({
        userId: student1.id,
        department: "Computer Science",
        cgpa: "3.8",
        graduationYear: 2024,
        resumeUrl: "https://example.com/resume_alice.pdf"
      });

      const student2 = await storage.createUser({
        username: "bob",
        password: studentPass,
        role: "student",
        name: "Bob Johnson",
        email: "bob@student.edu",
      });
      students.push(student2);
      await storage.createStudent({
        userId: student2.id,
        department: "Information Technology",
        cgpa: "3.6",
        graduationYear: 2024,
        resumeUrl: "https://example.com/resume_bob.pdf"
      });

      const student3 = await storage.createUser({
        username: "carol",
        password: studentPass,
        role: "student",
        name: "Carol Davis",
        email: "carol@student.edu",
      });
      students.push(student3);
      await storage.createStudent({
        userId: student3.id,
        department: "Computer Science",
        cgpa: "3.9",
        graduationYear: 2025,
        resumeUrl: "https://example.com/resume_carol.pdf"
      });

      const student4 = await storage.createUser({
        username: "david",
        password: studentPass,
        role: "student",
        name: "David Brown",
        email: "david@student.edu",
      });
      students.push(student4);
      await storage.createStudent({
        userId: student4.id,
        department: "Electronics Engineering",
        cgpa: "3.5",
        graduationYear: 2024,
        resumeUrl: "https://example.com/resume_david.pdf"
      });

      const student5 = await storage.createUser({
        username: "emma",
        password: studentPass,
        role: "student",
        name: "Emma Wilson",
        email: "emma@student.edu",
      });
      students.push(student5);
      await storage.createStudent({
        userId: student5.id,
        department: "Data Science",
        cgpa: "3.7",
        graduationYear: 2024,
        resumeUrl: "https://example.com/resume_emma.pdf"
      });

      // Create Jobs
      const job1 = await storage.createJob({
        employerId: employers[0].id,
        title: "Junior React Developer",
        description: "We are looking for a junior developer with React skills to join our fast-growing team. You'll work on innovative products and cutting-edge technologies.",
        requirements: "React, Node.js, TypeScript, CSS/HTML",
        location: "Remote",
        salary: "$60,000 - $70,000"
      });

      const job2 = await storage.createJob({
        employerId: employers[0].id,
        title: "Senior Backend Engineer",
        description: "Looking for an experienced backend engineer to lead our infrastructure team.",
        requirements: "Node.js, PostgreSQL, System Design, Docker",
        location: "San Francisco, CA",
        salary: "$120,000 - $150,000"
      });

      const job3 = await storage.createJob({
        employerId: employers[1].id,
        title: "ML Engineer",
        description: "Join our AI/ML team to develop cutting-edge machine learning solutions.",
        requirements: "Python, TensorFlow, PyTorch, AWS",
        location: "Remote",
        salary: "$100,000 - $130,000"
      });

      const job4 = await storage.createJob({
        employerId: employers[1].id,
        title: "Data Scientist",
        description: "Work with large-scale datasets and build predictive models.",
        requirements: "Python, SQL, Pandas, Statistics",
        location: "New York, NY",
        salary: "$90,000 - $120,000"
      });

      const job5 = await storage.createJob({
        employerId: employers[2].id,
        title: "Management Consultant",
        description: "Help our clients solve complex business problems and drive transformations.",
        requirements: "Problem-solving, Communication, Analytics",
        location: "Various",
        salary: "$80,000 - $100,000"
      });

      const job6 = await storage.createJob({
        employerId: employers[2].id,
        title: "Full Stack Developer",
        description: "Build end-to-end solutions for our enterprise clients.",
        requirements: "React, Node.js, MongoDB, AWS",
        location: "Chicago, IL",
        salary: "$85,000 - $110,000"
      });

      // Create Sample Applications
      await storage.createApplication({
        jobId: job1.id,
        studentId: students[0].id,
      });

      await storage.createApplication({
        jobId: job1.id,
        studentId: students[1].id,
      });

      await storage.createApplication({
        jobId: job3.id,
        studentId: students[4].id,
      });

      await storage.createApplication({
        jobId: job4.id,
        studentId: students[4].id,
      });

      await storage.createApplication({
        jobId: job2.id,
        studentId: students[2].id,
      });

      console.log("✓ Database seeded successfully with sample data!");
    }
  };

  // Run seed
  seedDatabase().catch(err => console.error("Error seeding database:", err));

  return httpServer;
}
