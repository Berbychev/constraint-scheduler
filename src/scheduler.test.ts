import { describe, expect, it } from "vitest";
import { scheduleJobs } from "./scheduler";
import type { Job, Worker } from "./types";

const workers: Worker[] = [
  { id: "a", name: "A", skills: ["assembly"], capacityHours: 8 },
  { id: "b", name: "B", skills: ["assembly", "vacuum"], capacityHours: 16 }
];

describe("scheduleJobs", () => {
  it("rejects workers that do not have all required skills", () => {
    const jobs: Job[] = [{ id: "j1", title: "J1", requiredSkills: ["assembly", "vacuum"], hours: 4, deadline: "2030-01-01", priority: "high" }];
    const result = scheduleJobs(workers, jobs);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].workerId).toBe("b");
    expect(result.assignments[0].rejected.some((item) => item.workerId === "a" && item.reasons.some((reason) => reason.includes("Missing skill")))).toBe(true);
  });

  it("does not exceed worker capacity", () => {
    const jobs: Job[] = [
      { id: "j1", title: "J1", requiredSkills: ["assembly", "vacuum"], hours: 12, deadline: "2030-01-01", priority: "high" },
      { id: "j2", title: "J2", requiredSkills: ["assembly", "vacuum"], hours: 8, deadline: "2030-01-02", priority: "high" }
    ];
    const result = scheduleJobs(workers, jobs);
    expect(result.assignments).toHaveLength(1);
    expect(result.unscheduled).toHaveLength(1);
    expect(result.workerLoad.b).toBe(12);
  });

  it("processes earlier deadlines before later jobs", () => {
    const jobs: Job[] = [
      { id: "late", title: "Late", requiredSkills: ["assembly"], hours: 8, deadline: "2030-01-03", priority: "high" },
      { id: "early", title: "Early", requiredSkills: ["assembly"], hours: 8, deadline: "2030-01-01", priority: "low" }
    ];
    const result = scheduleJobs([{ id: "a", name: "A", skills: ["assembly"], capacityHours: 8 }], jobs);
    expect(result.assignments[0].jobId).toBe("early");
    expect(result.unscheduled[0].job.id).toBe("late");
  });
});
