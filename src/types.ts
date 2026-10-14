export type Priority = "low" | "medium" | "high";

export interface Worker {
  id: string;
  name: string;
  skills: string[];
  capacityHours: number;
}

export interface Job {
  id: string;
  title: string;
  requiredSkills: string[];
  hours: number;
  deadline: string;
  priority: Priority;
}

export interface CandidateEvaluation {
  workerId: string;
  workerName: string;
  eligible: boolean;
  score: number | null;
  reasons: string[];
}

export interface Assignment {
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  hours: number;
  deadline: string;
  priority: Priority;
  score: number;
  reasons: string[];
  rejected: CandidateEvaluation[];
}

export interface UnscheduledJob {
  job: Job;
  evaluations: CandidateEvaluation[];
}

export interface ScheduleResult {
  assignments: Assignment[];
  unscheduled: UnscheduledJob[];
  workerLoad: Record<string, number>;
}
