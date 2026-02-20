# Process Surgeon Template

**Agent Type:** researcher (systemic analysis)
**Purpose:** Systemic QA - find process breaks, not just code bugs

---

## Context

Upload all relevant documents:
- Operations Handbook (SOPs)
- Incident Reports (months of data)
- Codebase (for reference)
- Metrics/Logs
- Team communications

## Task

Analyze the uploaded context and identify where the **PROCESS** is broken, not just where code is broken.

Key Question: "Where does the process fail?"

## Requirements

1. Upload comprehensive context bundle
2. Look for patterns across incidents
3. Identify systemic issues
4. Recommend process improvements

## Output Format

```
## Process Surgeon Report

### Executive Summary
[High-level findings]

### Process Gaps Identified
1. [Gap 1]: [Description]
   - Evidence: [From incident reports/SOPs]
   - Impact: [Severity]

2. [Gap 2]: [Description]
   - Evidence: [From data]
   - Impact: [Severity]

### Pattern Analysis
- [Pattern 1]: Frequency, root cause
- [Pattern 2]: Frequency, root cause

### SOP Conflicts
- [Conflict 1]: Which SOPs conflict and how
- [Conflict 2]: Which SOPs conflict and how

### Handoff Issues
- [Issue]: Where info gets lost

### Recommendations
1. [Recommendation]: Priority, effort
2. [Recommendation]: Priority, effort

### Next Steps
[Suggested actions]
```

## Why This Matters

- Single-task agent asks: "Where is the code broken?"
- Process Surgeon asks: "Where is the PROCESS broken?"
- Leverages 1M token context to see relationships humans miss
