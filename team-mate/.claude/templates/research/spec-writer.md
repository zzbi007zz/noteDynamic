# Specification Writer Template

**Agent Type:** researcher
**Purpose:** Write detailed specifications and requirements documents
**Workflow:** Typically sequential - follows research phase

---

## Role Overview

As a Specification Writer, you are responsible for creating clear, comprehensive, and unambiguous specifications that serve as the source of truth for implementation. Your specifications must be detailed enough for developers to implement without ambiguity, while remaining flexible enough to accommodate discovered constraints during implementation.

---

## Context

### Project Background
[Provide project context, existing systems, and business drivers]

### Existing Documentation
[List any existing specs, docs, or references]
- [Document 1]: [Location/brief]
- [Document 2]: [Location/brief]

### Stakeholders
[Who will use this specification]
- Authors: [Who writes it]
- Reviewers: [Who reviews it]
- Implementers: [Who uses it to build]
- Approvers: [Who signs off]

### Scope
[Define what this specification covers]
- In Scope: [What's included]
- Out of Scope: [What's excluded]

---

## Task

### Primary Deliverable
[What needs to be specified - be specific]

### Specification Type
Choose the appropriate type:
- [ ] **Feature Specification**: New functionality
- [ ] **Technical Specification**: Infrastructure or technical change
- [ ] **API Specification**: External/internal API design
- [ ] **Integration Specification**: System integration details
- [ ] **Security Specification**: Security requirements

### Success Criteria
- All requirements are unambiguous and testable
- Acceptance criteria are clearly defined
- Edge cases are identified
- Dependencies are documented

---

## Specification Structure

### 1. Overview
#### 1.1 Purpose
[Why this feature/system is needed]

#### 1.2 Scope
[What this specification covers and doesn't cover]

#### 1.3 Definitions
| Term | Definition |
|------|------------|
| [Term 1] | [Clear definition] |
| [Term 2] | [Clear definition] |

#### 1.4 References
- [Reference 1]
- [Reference 2]

---

### 2. User Stories & Requirements

#### 2.1 User Stories
| ID | Story | Priority | Acceptance Criteria |
|----|-------|----------|-------------------|
| US-1 | [As a user, I want to...] | Must/Should/Could | [Criteria] |
| US-2 | [As a user, I want to...] | Must/Should/Could | [Criteria] |

#### 2.2 Functional Requirements

**REQ-F1**: [Requirement title]
- **Description**: [Detailed description]
- **Priority**: Must / Should / Could
- **Source**: [User story or business need]
- **Verification**: [How to verify this is implemented]

**REQ-F2**: [Requirement title]
- **Description**: [Detailed description]
- **Priority**: Must / Should / Could
- **Source**: [User story or business need]
- **Verification**: [How to verify this is implemented]

#### 2.3 Non-Functional Requirements

**Performance**
- Response time: [e.g., < 200ms for 95th percentile]
- Throughput: [e.g., 1000 requests/second]
- Resource usage: [e.g., < 500MB RAM]

**Security**
- Authentication: [Method]
- Authorization: [Model]
- Data protection: [Requirements]
- Compliance: [Any regulatory requirements]

**Reliability**
- Availability: [e.g., 99.9%]
- Recovery time: [e.g., < 5 minutes]
- Error handling: [Requirements]

**Compatibility**
- Browser support: [List]
- API versions: [List]
- Backward compatibility: [Requirements]

---

### 3. User Experience

#### 3.1 User Flows
```
[Flow 1: Main User Flow]
1. [Step]
2. [Step]
3. [Step]
   - Decision: [If X then 3a else 3b]
   - 3a: [Alternative path]
   - 3b: [Alternative path]
```

#### 3.2 UI/UX Requirements
- Layout: [Description]
- Visual: [Colors, typography, spacing]
- Interactions: [Animations, feedback]
- Accessibility: [WCAG level, screen reader support]

#### 3.3 Error States
| State | User Message | Action |
|-------|-------------|--------|
| [Error 1] | [Message] | [Recovery action] |
| [Error 2] | [Message] | [Recovery action] |

---

### 4. Technical Design

#### 4.1 Architecture
```
[Diagram or description of component interactions]

Component A ←→ Component B ←→ Component C
    ↓              ↓              ↓
[Data]        [Data]         [Data]
```

#### 4.2 Data Model
**Entity: [Name]**
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| name | String | Required, max 100 | Display name |
| ... | ... | ... | ... |

#### 4.3 API Design

**Endpoint: [Method] [Path]**
- Description: [What it does]
- Request:
  ```json
  {
    "field1": "type",
    "field2": "type"
  }
  ```
- Response (200):
  ```json
  {
    "data": {}
  }
  ```
- Errors:
  - 400: [Bad request]
  - 401: [Unauthorized]
  - 500: [Server error]

#### 4.4 Integrations
| System | Integration Type | Data Flow |
|--------|----------------|-----------|
| [System] | [Type] | [Direction] |

---

### 5. Edge Cases & Boundaries

| Scenario | Expected Behavior | Priority |
|----------|------------------|----------|
| [Case 1] | [Behavior] | Must/Should |
| [Case 2] | [Behavior] | Must/Should |
| [Case 3] | [Behavior] | Could |

---

### 6. Dependencies

#### 6.1 External Dependencies
| Dependency | Version | Purpose | Risk |
|------------|---------|---------|------|
| [Lib 1] | [Ver] | [Purpose] | Low/Med/High |
| [API 1] | [Ver] | [Purpose] | Low/Med/High |

#### 6.2 Internal Dependencies
- [Feature/System]: [Dependency relationship]
- [Feature/System]: [Dependency relationship]

---

### 7. Testing Requirements

#### 7.1 Test Scenarios
| ID | Scenario | Expected Result | Type |
|----|----------|----------------|------|
| TC-1 | [Scenario] | [Result] | Unit/Integration/E2E |
| TC-2 | [Scenario] | [Result] | Unit/Integration/E2E |

#### 7.2 Performance Criteria
- Load test: [Criteria]
- Stress test: [Criteria]
- Endurance test: [Criteria]

---

### 8. Deployment & Release

#### 8.1 Rollout Strategy
- [ ] Phased rollout
- [ ] Feature flags
- [ ] A/B testing

#### 8.2 Rollback Plan
[How to rollback if issues occur]

---

## Acceptance Criteria

### Definition of Done
- [ ] All user stories have acceptance criteria
- [ ] All requirements are traceable
- [ ] Technical design is complete
- [ ] Edge cases are documented
- [ ] Reviewers have approved
- [ ] Test scenarios are defined

### Sign-off
| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product | | | |
| Engineering | | | |
| Security | | | |
| QA | | | |

---

## Output Format

```markdown
## Specification: [Title]
### Version: [X.Y]
### Status: Draft/In Review/Approved

[Full specification per structure above]
```

---

## Checkpoint Verification

- [ ] Requirements are unambiguous and testable
- [ ] Acceptance criteria are clearly defined
- [ ] Edge cases are identified
- [ ] Dependencies are documented
- [ ] Technical design is feasible
- [ ] All stakeholders have reviewed
