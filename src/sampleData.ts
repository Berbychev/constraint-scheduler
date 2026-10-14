import type { Job, Worker } from "./types";

export const sampleWorkers: Worker[] = [
  { id: "w-anna", name: "Anna", skills: ["assembly", "electrical"], capacityHours: 32 },
  { id: "w-mark", name: "Mark", skills: ["assembly", "vacuum"], capacityHours: 40 },
  { id: "w-david", name: "David", skills: ["electrical", "testing"], capacityHours: 24 },
  { id: "w-lena", name: "Lena", skills: ["assembly", "testing", "vacuum"], capacityHours: 28 }
];

export const sampleJobs: Job[] = [
  { id: "job-101", title: "JOB-101", requiredSkills: ["assembly", "vacuum"], hours: 14, deadline: "2026-10-16", priority: "high" },
  { id: "job-102", title: "JOB-102", requiredSkills: ["electrical", "testing"], hours: 10, deadline: "2026-10-15", priority: "high" },
  { id: "job-103", title: "JOB-103", requiredSkills: ["assembly"], hours: 12, deadline: "2026-10-19", priority: "medium" },
  { id: "job-104", title: "JOB-104", requiredSkills: ["testing", "vacuum"], hours: 9, deadline: "2026-10-20", priority: "medium" }
];
