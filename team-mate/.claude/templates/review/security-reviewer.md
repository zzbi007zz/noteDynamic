# Security Reviewer Template

**Agent Type:** code-reviewer
**Purpose:** Review code for security vulnerabilities

---

## Context

[Files to review, threat model, security requirements]

## Task

Security review for:

[Describe what to review]

## Requirements

1. Check for OWASP vulnerabilities
2. Verify authentication/authorization
3. Check data protection
4. Identify potential exploits

## Output Format

```
## Security Review

### Scope
[What's being reviewed]

### Findings
| Severity | Vulnerability | CWE | Recommendation |
|----------|---------------|-----|----------------|
| Critical | [Issue] | [CWE] | [Fix] |
| High | [Issue] | [CWE] | [Fix] |
| Medium | [Issue] | [CWE] | [Fix] |

### Security Score
[1-10]

### Verdict
[Approved / Needs Fixes]
```
