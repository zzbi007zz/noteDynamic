# Jira Connector Template

**Type:** Connector
**Purpose:** Integrate with Jira for task management

---

## Context

[Jira instance URL, project key, authentication]

## Task

[Describe the Jira action needed]

Examples:
- Fetch issues from project [PROJECT]
- Create issue with title [TITLE] and description [DESC]
- Update issue [KEY] status to [STATUS]
- Add comment to issue [KEY]

## Requirements

1. Use Jira REST API
2. Map fields correctly
3. Handle rate limits
4. Report status changes

## Output Format

```
## Jira Connector Result

### Action
[What was done]

### Issue(s)
- [KEY]: [Summary] - [Status]

### Response
[API response summary]

### Errors
[Any errors]
```
