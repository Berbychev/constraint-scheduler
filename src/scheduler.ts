import type { CandidateEvaluation, Job, Priority, ScheduleResult, Worker } from "./types";

const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
const normalizeSkills = (skills: string[]) => skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
const unique = <T,>(items: T[]) => Array.from(new Set(items));

function daysUntil(deadline: string): number {
  const today = new Date();
  const due = new Date(`${deadline}T23:59:59`);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

function evaluateCandidate(worker: Worker, job: Job, assignedHours: number): CandidateEvaluation {
  const workerSkills = normalizeSkills(worker.skills);
  const requiredSkills = normalizeSkills(job.requiredSkills);
  const missingSkills = requiredSkills.filter((skill) => !workerSkills.includes(skill));
  const available = worker.capacityHours - assignedHours;

  if (missingSkills.length > 0) {
    return { workerId: worker.id, workerName: worker.name, eligible: false, score: null, reasons: [`Missing skill: ${missingSkills.join(", ")}`] };
  }

  if (available < job.hours) {
    return { workerId: worker.id, workerName: worker.name, eligible: false, score: null, reasons: [`Insufficient capacity: ${available.toFixed(1)} h available, ${job.hours} h required`] };
  }

  const exactSkillMatch = workerSkills.length === unique(requiredSkills).length;
  const utilizationBefore = worker.capacityHours === 0 ? 1 : assignedHours / worker.capacityHours;
  const capacityAfter = available - job.hours;
  const postUtilization = worker.capacityHours === 0 ? 1 : (assignedHours + job.hours) / worker.capacityHours;
  const score = postUtilization * 100 + capacityAfter * 0.35 - (exactSkillMatch ? 3 : 0) + utilizationBefore * 4;

  const reasons = [
    `All required skills available: ${requiredSkills.join(", ")}`,
    `${available.toFixed(1)} h capacity available before assignment`,
    `${capacityAfter.toFixed(1)} h capacity remains after assignment`
  ];
  if (exactSkillMatch) reasons.push("Exact skill fit avoids consuming broader specialist capacity");

  return { workerId: worker.id, workerName: worker.name, eligible: true, score: Number(score.toFixed(2)), reasons };
}

export function scheduleJobs(workers: Worker[], jobs: Job[]): ScheduleResult {
  const workerLoad = Object.fromEntries(workers.map((worker) => [worker.id, 0]));
  const orderedJobs = [...jobs].sort((a, b) => {
    const deadlineCompare = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (deadlineCompare !== 0) return deadlineCompare;
    const priorityCompare = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityCompare !== 0) return priorityCompare;
    return b.hours - a.hours;
  });

  const assignments: ScheduleResult["assignments"] = [];
  const unscheduled: ScheduleResult["unscheduled"] = [];

  for (const job of orderedJobs) {
    const evaluations = workers.map((worker) => evaluateCandidate(worker, job, workerLoad[worker.id] ?? 0));
    const eligible = evaluations
      .filter((evaluation): evaluation is CandidateEvaluation & { score: number } => evaluation.eligible && evaluation.score !== null)
      .sort((a, b) => a.score - b.score);
    const chosen = eligible[0];

    if (!chosen) {
      unscheduled.push({ job, evaluations });
      continue;
    }

    workerLoad[chosen.workerId] = (workerLoad[chosen.workerId] ?? 0) + job.hours;
    const urgency = daysUntil(job.deadline);
    const reasons = [...chosen.reasons];
    if (urgency <= 1) reasons.push("Job is due within 1 day and was scheduled before later work");
    else if (urgency <= 3) reasons.push("Near-term deadline increased scheduling precedence");

    assignments.push({
      jobId: job.id,
      jobTitle: job.title,
      workerId: chosen.workerId,
      workerName: chosen.workerName,
      hours: job.hours,
      deadline: job.deadline,
      priority: job.priority,
      score: chosen.score,
      reasons,
      rejected: evaluations.filter((evaluation) => evaluation.workerId !== chosen.workerId)
    });
  }

  return { assignments, unscheduled, workerLoad };
}
