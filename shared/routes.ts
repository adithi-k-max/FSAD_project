import { z } from "zod";
import { insertUserSchema, insertStudentSchema, insertEmployerSchema, insertJobSchema, insertApplicationSchema, users, students, employers, jobs, applications, type User, type Student, type Employer, type Job, type Application, type InsertUser, type InsertStudent, type InsertEmployer, type InsertJob, type InsertApplication, applicationStatuses, type ApplicationStatus, userRoles, type UserRole } from "./schema";

// Re-export types
export type { User, Student, Employer, Job, Application, InsertUser, InsertStudent, InsertEmployer, InsertJob, InsertApplication, ApplicationStatus, UserRole };
export { applicationStatuses, userRoles };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema.extend({
        studentDetails: insertStudentSchema.omit({ userId: true }).optional(),
        employerDetails: insertEmployerSchema.omit({ userId: true }).optional(),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    list: {
      method: "GET" as const,
      path: "/api/users", // Admin only
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    approveEmployer: {
      method: "PATCH" as const,
      path: "/api/employers/:id/approve",
      responses: {
        200: z.custom<typeof employers.$inferSelect>(),
      },
    },
  },
  jobs: {
    list: {
      method: "GET" as const,
      path: "/api/jobs",
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect & { employer: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/jobs",
      input: insertJobSchema.omit({ employerId: true }),
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/jobs/:id",
      responses: {
        200: z.custom<typeof jobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  applications: {
    list: {
      method: "GET" as const,
      path: "/api/applications",
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect & { job: typeof jobs.$inferSelect, student: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/applications",
      input: z.object({ jobId: z.number() }),
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/applications/:id/status",
      input: z.object({ status: z.enum(["applied", "shortlisted", "selected", "rejected"]) }),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
      },
    },
  },
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats", // Admin/Officer
      responses: {
        200: z.object({
          totalStudents: z.number(),
          totalEmployers: z.number(),
          totalJobs: z.number(),
          placements: z.number(),
        }),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
export const buildUrlHelper = buildUrl;