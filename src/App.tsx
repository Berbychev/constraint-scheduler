import { useMemo, useState } from "react";
import { sampleJobs, sampleWorkers } from "./sampleData";
import { scheduleJobs } from "./scheduler";
import type { Job, Priority, Worker } from "./types";

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const splitSkills = (value: string) => value.split(",").map((skill) => skill.trim().toLowerCase()).filter(Boolean);

function App() {
  const [workers, setWorkers] = useState<Worker[]>(sampleWorkers);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [hasRun, setHasRun] = useState(true);
  const result = useMemo(() => (hasRun ? scheduleJobs(workers, jobs) : null), [workers, jobs, hasRun]);

  const [workerForm, setWorkerForm] = useState({ name: "", skills: "", capacityHours: "40" });
  const [jobForm, setJobForm] = useState({
    title: "",
    skills: "",
    hours: "8",
    deadline: new Date().toISOString().slice(0, 10),
    priority: "medium" as Priority,
  });

  const addWorker = () => {
    const capacityHours = Number(workerForm.capacityHours);
    if (!workerForm.name.trim() || splitSkills(workerForm.skills).length === 0 || !Number.isFinite(capacityHours) || capacityHours <= 0) return;
    setWorkers((current) => [...current, { id: makeId("worker"), name: workerForm.name.trim(), skills: splitSkills(workerForm.skills), capacityHours }]);
    setWorkerForm({ name: "", skills: "", capacityHours: "40" });
    setHasRun(false);
  };

  const addJob = () => {
    const hours = Number(jobForm.hours);
    if (!jobForm.title.trim() || splitSkills(jobForm.skills).length === 0 || !Number.isFinite(hours) || hours <= 0 || !jobForm.deadline) return;
    setJobs((current) => [...current, { id: makeId("job"), title: jobForm.title.trim(), requiredSkills: splitSkills(jobForm.skills), hours, deadline: jobForm.deadline, priority: jobForm.priority }]);
    setJobForm((current) => ({ ...current, title: "", skills: "", hours: "8" }));
    setHasRun(false);
  };

  const totalCapacity = workers.reduce((sum, worker) => sum + worker.capacityHours, 0);
  const plannedHours = jobs.reduce((sum, job) => sum + job.hours, 0);
  const scheduledHours = result?.assignments.reduce((sum, assignment) => sum + assignment.hours, 0) ?? 0;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">EXPLAINABLE WORKFORCE PLANNING</p>
          <h1>Constraint Scheduler</h1>
          <p className="hero-copy">Assign work from skills, available capacity, deadlines and priority. Every assignment explains why it was selected and why alternatives were rejected.</p>
        </div>
        <button className="primary" onClick={() => setHasRun(true)}>Run scheduler</button>
      </header>

      <section className="metrics">
        <Metric label="Workers" value={workers.length.toString()} />
        <Metric label="Jobs" value={jobs.length.toString()} />
        <Metric label="Capacity" value={`${totalCapacity} h`} />
        <Metric label="Scheduled" value={hasRun ? `${scheduledHours}/${plannedHours} h` : "not run"} />
      </section>

      <section className="grid two-col">
        <Panel title="Workers" subtitle="Skills and weekly capacity">
          <div className="stack">
            {workers.map((worker) => (
              <article className="entity-card" key={worker.id}>
                <div>
                  <strong>{worker.name}</strong>
                  <div className="chips">{worker.skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
                </div>
                <div className="entity-side">
                  <span>{worker.capacityHours} h</span>
                  <button className="link-button" onClick={() => { setWorkers((current) => current.filter((item) => item.id !== worker.id)); setHasRun(false); }}>remove</button>
                </div>
              </article>
            ))}
          </div>
          <div className="form-grid worker-form">
            <input placeholder="Name" value={workerForm.name} onChange={(event) => setWorkerForm({ ...workerForm, name: event.target.value })} />
            <input placeholder="assembly, testing" value={workerForm.skills} onChange={(event) => setWorkerForm({ ...workerForm, skills: event.target.value })} />
            <input type="number" min="1" placeholder="Hours" value={workerForm.capacityHours} onChange={(event) => setWorkerForm({ ...workerForm, capacityHours: event.target.value })} />
            <button onClick={addWorker}>Add worker</button>
          </div>
        </Panel>

        <Panel title="Jobs" subtitle="Requirements, effort and due date">
          <div className="stack">
            {jobs.map((job) => (
              <article className="entity-card" key={job.id}>
                <div>
                  <div className="title-line"><strong>{job.title}</strong><span className={`priority ${job.priority}`}>{job.priority}</span></div>
                  <div className="chips">{job.requiredSkills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
                  <small>{job.hours} h · due {job.deadline}</small>
                </div>
                <button className="link-button" onClick={() => { setJobs((current) => current.filter((item) => item.id !== job.id)); setHasRun(false); }}>remove</button>
              </article>
            ))}
          </div>
          <div className="form-grid job-form">
            <input placeholder="JOB-105" value={jobForm.title} onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })} />
            <input placeholder="assembly, vacuum" value={jobForm.skills} onChange={(event) => setJobForm({ ...jobForm, skills: event.target.value })} />
            <input type="number" min="1" value={jobForm.hours} onChange={(event) => setJobForm({ ...jobForm, hours: event.target.value })} />
            <input type="date" value={jobForm.deadline} onChange={(event) => setJobForm({ ...jobForm, deadline: event.target.value })} />
            <select value={jobForm.priority} onChange={(event) => setJobForm({ ...jobForm, priority: event.target.value as Priority })}>
              <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
            </select>
            <button onClick={addJob}>Add job</button>
          </div>
        </Panel>
      </section>

      <section className="toolbar">
        <button onClick={() => { setWorkers(sampleWorkers); setJobs(sampleJobs); setHasRun(true); }}>Load sample</button>
        <button onClick={() => { setWorkers([]); setJobs([]); setHasRun(false); }}>Clear all</button>
      </section>

      <Panel title="Schedule" subtitle="Assignments are deterministic for the same input">
        {!hasRun && <div className="empty-state">Input changed. Run the scheduler to calculate a new plan.</div>}
        {hasRun && result && (
          <div className="results-layout">
            <div className="stack">
              {result.assignments.map((assignment) => (
                <article className="assignment-card" key={assignment.jobId}>
                  <div className="assignment-head">
                    <div><span className="assignment-job">{assignment.jobTitle}</span><strong>{assignment.workerName}</strong></div>
                    <div className="score">score {assignment.score}</div>
                  </div>
                  <div className="assignment-meta">{assignment.hours} h · due {assignment.deadline} · {assignment.priority}</div>
                  <details>
                    <summary>Why this assignment?</summary>
                    <ul>{assignment.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                    <h4>Alternatives</h4>
                    <div className="alternatives">
                      {assignment.rejected.map((candidate) => (
                        <div className="alternative" key={candidate.workerId}>
                          <strong>{candidate.workerName}</strong>
                          <span>{candidate.eligible ? `eligible · score ${candidate.score}` : "rejected"}</span>
                          <small>{candidate.reasons.join(" · ")}</small>
                        </div>
                      ))}
                    </div>
                  </details>
                </article>
              ))}
              {result.assignments.length === 0 && <div className="empty-state">No assignments generated.</div>}
            </div>

            <aside className="load-panel">
              <h3>Worker load</h3>
              {workers.map((worker) => {
                const used = result.workerLoad[worker.id] ?? 0;
                const percent = worker.capacityHours === 0 ? 0 : Math.round((used / worker.capacityHours) * 100);
                return (
                  <div className="load-row" key={worker.id}>
                    <div className="load-label"><span>{worker.name}</span><span>{used}/{worker.capacityHours} h</span></div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${Math.min(percent, 100)}%` }} /></div>
                  </div>
                );
              })}
              {result.unscheduled.length > 0 && (
                <div className="unscheduled">
                  <h3>Unscheduled</h3>
                  {result.unscheduled.map(({ job, evaluations }) => (
                    <details key={job.id}>
                      <summary>{job.title}</summary>
                      {evaluations.map((evaluation) => <small key={evaluation.workerId}><strong>{evaluation.workerName}:</strong> {evaluation.reasons.join(" · ")}</small>)}
                    </details>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </Panel>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="panel"><div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</section>;
}

export default App;
