# Constraint Scheduler

An explainable workforce scheduling engine built with React and TypeScript.

It assigns jobs to workers using:

- required skills
- available capacity
- deadline
- priority
- current workload

The scheduler does not only produce an assignment. It also records why a worker was selected and why alternatives were rejected.

## Why this project exists

Small production and engineering teams often plan work with spreadsheets, whiteboards or manually maintained capacity tables.

That works until several constraints interact:

```text
worker skills
      +
available hours
      +
job effort
      +
deadline
      +
priority
      ↓
feasible assignment
```

The difficult part is not generating *some* plan.

The difficult part is generating a plan that can be inspected and explained.

## Example

Workers:

```text
Anna
skills: assembly, electrical
capacity: 32 h

Mark
skills: assembly, vacuum
capacity: 40 h

David
skills: electrical, testing
capacity: 24 h
```

Job:

```text
JOB-101
skills: assembly, vacuum
effort: 14 h
deadline: Friday
priority: high
```

Result:

```text
JOB-101 → Mark

Why:
✓ all required skills available
✓ enough remaining capacity
✓ workload remains within weekly limit

Anna rejected:
✗ missing vacuum skill

David rejected:
✗ missing assembly skill
✗ missing vacuum skill
```

## Scheduling model

Jobs are processed by:

1. earliest deadline
2. higher priority
3. larger effort

For each job, every worker is evaluated.

A worker is ineligible when:

```text
missing required skill
OR
available capacity < job effort
```

Eligible workers receive a deterministic score.

Lower scores are preferred.

The current model considers:

- post-assignment utilization
- capacity remaining after assignment
- existing workload
- whether the worker is an exact skill fit

The scoring function is intentionally simple and visible in `src/scheduler.ts`.

The goal of the project is not to hide planning logic behind a black box.

## Features

- add and remove workers
- define worker skills and weekly capacity
- add and remove jobs
- define required skills, effort, deadline and priority
- calculate deterministic assignments
- show worker utilization
- explain every assignment
- show rejected alternatives
- identify jobs that cannot be scheduled
- sample dataset included
- unit tests for scheduling rules

## Stack

`TypeScript` · `React` · `Vite` · `Vitest`

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Tests:

```bash
npm test
```

## Architecture

```text
                 ┌─────────────────┐
                 │      Input      │
                 │ workers + jobs  │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   Validation    │
                 │ skills/capacity │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Candidate eval  │
                 │ worker × job    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Scoring model  │
                 │ deterministic   │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   Assignment    │
                 │ + explanation   │
                 └─────────────────┘
```

## Project principles

```text
feasibility before optimization
traceable logic before magic
explicit rejection reasons
deterministic output
no silent capacity overbooking
```

## Possible next steps

- worker availability by day
- multi-worker jobs
- job dependencies
- certifications with expiry dates
- shift planning
- overtime limits
- due-date penalties
- scenario comparison
- OR-Tools optimization backend
- CSV import/export
- persistent projects
- REST API
- Monte Carlo simulation for uncertain task duration

## License

MIT
