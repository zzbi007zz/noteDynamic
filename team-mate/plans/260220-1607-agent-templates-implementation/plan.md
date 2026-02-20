# Plan: Agent Templates Implementation

**Date:** 2026-02-20
**Source:** Opus 4 Agent Team Structure Report
**Type:** implementation-plan

---

## Overview

Implement reusable agent prompt templates based on the Opus 4 team structure. Create a templates library that can be invoked quickly for common workflows.

**Status:** In Progress
**Priority:** High

---

## Phase 1: Create Template Structure

### Task 1.1: Create templates directory
- Create `.claude/templates/` directory
- Structure: `research/`, `implementation/`, `review/`, `connectors/`

### Task 1.2: Research Team Templates
- [ ] `research-lead.md` - Template for research lead agents
- [ ] `spec-writer.md` - Requirements writing template
- [ ] `arch-designer.md` - Architecture design template
- [ ] `tech-researcher.md` - Tech research template

### Task 1.3: Implementation Team Templates
- [ ] `implementation-lead.md` - Template for implementation leads
- [ ] `code-writer.md` - Code writing template
- [ ] `debugger.md` - Debugging template

### Task 1.4: Review Team Templates
- [ ] `review-lead.md` - Template for review leads
- [ ] `code-reviewer.md` - Code review template
- [ ] `security-reviewer.md` - Security review template

### Task 1.5: Connector Templates
- [ ] `connector-base.md` - Base connector template
- [ ] `jira-connector.md` - Jira integration template
- [ ] `notion-connector.md` - Notion integration template

### Task 1.6: Process Surgeon Template
- [ ] `process-surgeon.md` - Systemic QA template

---

## Phase 2: Create Workflow Scripts

### Task 2.1: Sequential Chain Script
- [ ] Script to execute sequential agent chain
- [ ] Input: list of tasks, output: aggregated results

### Task 2.2: Parallel Execution Script
- [ ] Script to spawn multiple agents in parallel
- [ ] Input: list of agent tasks, output: combined results

### Task 2.3: Checkpoint Validator
- [ ] Script to validate checkpoint outputs
- [ ] Input: agent output, criteria, output: pass/fail

---

## Phase 3: Test & Document

### Task 3.1: Test Templates
- [ ] Test each template with sample tasks
- [ ] Verify output format matches requirements

### Task 3.2: Create Usage Guide
- [ ] README for using templates
- [ ] Examples for each workflow pattern

---

## Success Criteria

1. All 14+ templates created and tested
2. Workflow scripts functional
3. Usage documentation complete
4. Templates produce consistent output format

---

## Key Files to Create

```
.claude/
├── templates/
│   ├── README.md
│   ├── research/
│   │   ├── research-lead.md
│   │   ├── spec-writer.md
│   │   ├── arch-designer.md
│   │   └── tech-researcher.md
│   ├── implementation/
│   │   ├── implementation-lead.md
│   │   ├── code-writer.md
│   │   └── debugger.md
│   ├── review/
│   │   ├── review-lead.md
│   │   ├── code-reviewer.md
│   │   └── security-reviewer.md
│   ├── connectors/
│   │   ├── connector-base.md
│   │   ├── jira-connector.md
│   │   └── notion-connector.md
│   └── process-surgeon.md
└── scripts/
    ├── sequential-chain.sh
    ├── parallel-spawn.sh
    └── checkpoint-validator.sh
```
