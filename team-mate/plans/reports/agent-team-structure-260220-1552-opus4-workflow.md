# Agent Team Structure Report: Opus 4 Workflow Implementation

**Date:** 2026-02-20
**Source:** The Operator's Guide to Opus 4
**Type:** agent-team-structure

---

## Executive Summary

This report outlines an agent team structure based on The Operator's Guide to Opus 4 best practices. The structure implements the three core workflows (sequential, parallel, and hierarchical) with specialized agents handling single, focused tasks. Each agent reports back to a super manager agent for coordination and final decision-making.

---

## Core Principles from Opus 4 Guide

1. **Single Responsibility**: Each agent handles one specific task
2. **Tool Use Throughout**: Leverage tools at every step, not just endpoints
3. **Checkpoint Verification**: Verify work at key milestones
4. **Sequential Chaining**: Chain agents where outputs feed into next steps
5. **Parallel Execution**: Use multiple agents for independent workstreams
6. **Results-Oriented**: Focus on完成任务 (completing tasks) over explaining

---

## Team Structure Overview

```
                        ┌─────────────────────┐
                        │   Super Manager     │
                        │  (You - Operator)   │
                        └──────────┬──────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Research Team   │   │ Implementation   │   │   Review Team    │
│    (Parallel)    │   │     Team         │   │    (Parallel)    │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
    ┌────┴────┐           ┌────┴────┐           ┌────┴────┐
    ▼         ▼           ▼         ▼           ▼         ▼
 ┌──────┐ ┌──────┐    ┌──────┐ ┌──────┐    ┌──────┐ ┌──────┐
 │Spec  │ │Arch  │    │Code  │ │Test  │    │Code  │ │Sec   │
 │Writer│ │Design│    │Writer│ │Runner│    │Review│ │Review│
 └──────┘ └──────┘    └──────┘ └──────┘    └──────┘ └──────┘
```

---

## Agent Definitions & Responsibilities

### Level 1: Super Manager (Operator)

**Role:** Human operator orchestrating the entire workflow
**Responsibilities:**
- Define high-level goals and requirements
- Spawn and coordinate all sub-agents
- Make final decisions on direction changes
- Verify final output quality
- Handle approval flow for critical steps

**Delegation Pattern:**
```
Goal → Spawn appropriate agent → Review output → Decide next action
```

---

### Level 2: Team Leads

#### Research Lead
**Agent Type:** `researcher`
**When to use:** Need to gather information, explore options, or understand a topic
**Responsibilities:**
- Conduct thorough research on assigned topics
- Provide structured findings with sources
- Identify risks and opportunities
- Report back with actionable insights

**Trigger phrases:** "research", "find out", "explore", "understand"

---

#### Implementation Lead
**Agent Type:** `fullstack-developer` or `planner`
**When to use:** Need to implement code, create plans, or execute technical work
**Responsibilities:**
- Break down requirements into implementable steps
- Execute implementation following best practices
- Coordinate with other implementation agents
- Ensure code quality and completeness

**Trigger phrases:** "implement", "build", "create", "add feature"

---

#### Review Lead
**Agent Type:** `code-reviewer` or `tester`
**When to use:** Need to verify quality, find bugs, or validate work
**Responsibilities:**
- Conduct thorough reviews of all deliverables
- Identify issues and provide recommendations
- Verify tests pass and quality standards met
- Report findings with severity levels

**Trigger phrases:** "review", "check", "verify", "test", "validate"

---

### Level 3: Specialized Agents (Single Task Workers)

#### Research Team (Parallel Execution)

| Agent | Specialty | Single Task |
|-------|-----------|-------------|
| `spec-writer` | Requirements | Write detailed specifications |
| `arch-designer` | Architecture | Design system architecture |
| `tech-researcher` | Technology | Research specific technologies |
| `competitor-analyst` | Market | Analyze alternatives |

**Workflow:** Spawn multiple researchers in parallel → Aggregate findings

---

#### Implementation Team (Sequential Chaining)

| Agent | Specialty | Single Task |
|-------|-----------|-------------|
| `code-writer` | Coding | Write actual code |
| `test-runner` | Testing | Run and create tests |
| `debugger` | Debugging | Fix bugs and issues |
| `integrator` | Integration | Combine components |

**Workflow:** Code → Test → Debug → Integrate (sequential chain)

---

#### Review Team (Parallel Verification)

| Agent | Specialty | Single Task |
|-------|-----------|-------------|
| `code-reviewer` | Code Quality | Review code for quality |
| `security-reviewer` | Security | Check for vulnerabilities |
| `performance-reviewer` | Performance | Analyze performance |
| `docs-reviewer` | Documentation | Verify docs completeness |

**Workflow:** Spawn multiple reviewers in parallel → Aggregate issues

---

## Advanced Concepts: Level 3 Improvements

### 1. Parallel Spawning: The 90-Minute to 5-Minute Tax Reduction

**Problem:** Manual configuration of each agent creates "technical tax"
**Solution:** Spawn multiple agents (A, B, C) simultaneously in a single message

**The Math:**
- Manual config: ~90 minutes (per agent setup + coordination)
- Parallel spawn: ~5 minutes (one prompt, multiple outputs)

**Implementation:**
```
[Single Message with Multiple Agent Spawns]

Task Agent A: "Research authentication libraries"
Task Agent B: "Design database schema for users"
Task Agent C: "Create UI wireframes for login"

[All execute in parallel, report back simultaneously]
```

**Key Insight:** Reduce the "technical tax" of agent management by spawning independent agents together.

---

### 2. Zero-Friction Connectors (Replace Wrappers)

**Problem:** Specialized agents (test-runner, spec-writer) become "wrappers" that require maintenance - the "Engineer's Trap"
**Solution:** Use Claude Connectors instead of wrappers

**The Shift:**

| Old Approach (Wrappers) | New Approach (Connectors) |
|------------------------|---------------------------|
| Agent "reads" files | Agent connects directly to live data |
| Manual sync required | OAuth-based real-time sync |
| You become "IT department" for AI | Zero maintenance overhead |

**Connector Types:**

| Connector | Use Case | Benefit |
|-----------|----------|---------|
| `jira-connector` | Task management | Agent sees live issues |
| `notion-connector` | Documentation | Agent reads current docs |
| `github-connector` | Code & PRs | Agent operates on real code |
| `slack-connector` | Communication | Agent sends notifications |
| `database-connector` | Data access | Agent queries live data |

**Example:**
```
Instead of: "spec-writer agent reads your requirements file"
Use: "Connect Claude to Notion via OAuth → Agent has eyes on live specs"
```

---

### 3. Process Surgeon: Systemic QA

**Problem:** Code-level QA misses systemic issues in processes
**Solution:** Upload entire operations context + use "Process Surgeon" workflow

**The Logic:**
- Single-task agent: "Where is the code broken?"
- Process Surgeon: "Where is the PROCESS broken?"
- Leverages 1M token context to see relationships humans miss

**Process Surgeon Workflow:**

```
Step 1: Upload Context Bundle
  └─ Operations Handbook (SOPs)
  └─ Incident Reports (months of data)
  └─ Codebase (for reference)
  └─ Metrics/Logs

Step 2: Assign Systemic Task
  └─ "Identify where the process fails, not just code"

Step 3: Analysis Output
  └─ Root cause analysis (process level)
  └─ Pattern detection across incidents
  └─ Process gap identification
  └─ Recommended SOP revisions
```

**What Process Surgeon Finds:**
- SOPs that conflict with each other
- Handoffs where information gets lost
- Decision points lacking clear ownership
- Metrics that incentivize wrong behavior
- Patterns in incident reports humans miss

---

## Updated Team Structure (with Advanced Concepts)

```
                        ┌─────────────────────┐
                        │   Super Manager     │
                        │  (You - Operator)   │
                        └──────────┬──────────┘
                                   │
     ┌─────────────────────────────┼─────────────────────────────┐
     │                             │                             │
     ▼                             ▼                             ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Research Team   │   │ Connector Layer  │   │ Process Surgeon  │
│   (Parallel)      │   │ (Zero-Friction)  │   │   (Systemic QA)  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
    ┌────┴────┐           ┌────┴────┐           ┌────┴────┐
    ▼         ▼           ▼         ▼           ▼         ▼
 ┌──────┐ ┌──────┐    ┌──────┐ ┌──────┐    ┌──────┐ ┌──────┐
 │Spec  │ │Arch  │    │Jira  │ │Notion│    │SOP   │ │Inc   │
 │Writer│ │Design│    │Conn  │ │Conn  │    │Audit │ │Analysis
 └──────┘ └──────┘    └──────┘ └──────┘    └──────┘ └──────┘

Parallel Spawn:     Connect Directly:     Systemic Analysis:
A + B + C           OAuth to live data    Process-level QA
```

---

## Workflow Patterns

### Pattern 1: Sequential Chain

**Use when:** Tasks have dependencies - output of one feeds into next

```
Goal: Implement user authentication

Step 1: Planner Agent
  └─ Output: Implementation plan with steps

Step 2: Code Writer Agent
  └─ Input: Plan → Output: Auth code

Step 3: Test Runner Agent
  └─ Input: Code → Output: Test results

Step 4: Debugger Agent (if needed)
  └─ Input: Failed tests → Output: Fixed code

Step 5: Code Reviewer Agent
  └─ Input: Final code → Output: Review report
```

**Agent Chain:** `planner` → `code-writer` → `test-runner` → `debugger` → `code-reviewer`

---

### Pattern 2: Parallel Execution

**Use when:** Independent tasks that can run simultaneously

```
Goal: Build a feature with frontend and backend

Spawn Agent 1: Frontend Developer
  └─ Build React components

Spawn Agent 2: Backend Developer
  └─ Build API endpoints

Spawn Agent 3: Mobile Developer
  └─ Build React Native screens

[All run in parallel]

→ Integrate all outputs
```

**Agent Command:**
```bash
# Spawn multiple agents in single message
Task: "Build frontend component X" (agent: frontend-developer)
Task: "Build API endpoint Y" (agent: backend-developer)
Task: "Build mobile screen Z" (agent: mobile-developer)
```

---

### Pattern 3: Hierarchical (Super Manager)

**Use when:** Complex projects requiring multiple teams

```
Super Manager (You)
    │
    ├─→ Research Team Lead
    │     ├─→ Spec Writer
    │     └─→ Tech Researcher
    │
    ├─→ Implementation Team Lead
    │     ├─→ Code Writer
    │     └─→ Test Runner
    │
    └─→ Review Team Lead
          ├─→ Code Reviewer
          └─→ Security Reviewer
```

---

## Checkpoint System

At each checkpoint, super manager verifies:

| Checkpoint | Question | Action if Failed |
|------------|----------|------------------|
| After Research | "Does research answer the question?" | Respawn researcher |
| After Planning | "Is plan comprehensive?" | Revise with planner |
| After Code | "Does code compile?" | Send to debugger |
| After Tests | "Do all tests pass?" | Send to debugger |
| After Review | "Are issues resolved?" | Send back to code-writer |

---

## Reporting Chain

Each agent reports to super manager with:

```
## Agent Report: [Agent Type]
### Task: [What was assigned]
### Result: [What was accomplished]
### Issues: [Any problems encountered]
### Recommendation: [Next steps]
### Output: [Deliverables]
```

---

## Quick Reference: Agent Selection

| Need | Agent Type | Workflow |
|------|------------|----------|
| Explore codebase | `Explore` | Sequential |
| Research topic | `researcher` | Parallel |
| Plan implementation | `planner` | Sequential |
| Write code | `fullstack-developer` | Sequential |
| Run tests | `tester` | Sequential |
| Debug issue | `debugger` | Sequential |
| Review code | `code-reviewer` | Parallel |
| Design UI | `ui-ux-designer` | Parallel |
| Manage docs | `docs-manager` | Sequential |

---

## Summary

This team structure implements Opus 4 best practices:

1. **Super Manager** coordinates all work
2. **Specialized agents** handle single tasks
3. **Sequential chains** for dependent work
4. **Parallel execution** for independent tasks
5. **Checkpoint verification** at each stage
6. **Clear reporting** back to super manager

### Advanced Improvements (Level 3)

7. **Parallel Spawning** - Reduce 90-min tax to 5 mins
8. **Zero-Friction Connectors** - Replace wrappers with OAuth integrations
9. **Process Surgeon** - Systemic QA using full context

Each agent reports individually to the super manager, who then decides the next action based on the aggregated results.

---

**Unresolved Questions:**
- Should agents have ability to spawn sub-agents autonomously?
- How to handle agent failures - retry limit?
- What's the optimal parallel agent count to avoid context bloat?
- Which connectors should be prioritized for your workflow?
