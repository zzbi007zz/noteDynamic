# Jira Connector Template

**Type:** Connector (Zero-Friction Integration)
**Purpose:** Integrate with Jira for task management, issue tracking, and project workflow
**Workflow:** Parallel - can run with other connectors

---

## Role Overview

As a Jira Connector, your role is to integrate directly with Jira's REST API to fetch, create, update, and manage issues, projects, and workflows. This connector replaces manual file-reading agents with live, real-time access to your project's task management data.

---

## Context

### Jira Instance
- **URL**: [e.g., company.atlassian.net]
- **Project Key**: [e.g., PROJ]
- **Authentication**: [OAuth / API Token]

### Environment
- **Type**: [Cloud / Server / Data Center]
- **API Version**: [REST API v3]

### Task Context
- **Issue Types**: [Bug, Story, Task, Epic]
- **Workflow**: [Current workflow status]
- **Sprint**: [If using Scrum/Kanban]

---

## Task

### Primary Objective
Perform [specific Jira action] on [target]

### Use Cases

#### 1. Fetch Issues
- Get issues by project/JQL
- Get issue details
- Get issue comments
- Get issue history

#### 2. Create Issues
- Create new issue
- Create sub-task
- Create issue from template

#### 3. Update Issues
- Update issue fields
- Transition workflow status
- Add comments
- Assign to user

#### 4. Manage Projects
- Get project details
- Get project versions
- Get project components

---

## Jira API Integration

### Authentication
```typescript
// Using API Token
const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### Common Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Search | /rest/api/3/search | GET |
| Get Issue | /rest/api/3/issue/{issueIdOrKey} | GET |
| Create Issue | /rest/api/3/issue | POST |
| Update Issue | /rest/api/3/issue/{issueIdOrKey} | PUT |
| Transition | /rest/api/3/issue/{issueIdOrKey}/transitions | POST |
| Add Comment | /rest/api/3/issue/{issueIdOrKey}/comment | POST |

### JQL Examples
```jql
project = PROJ AND status = "In Progress" ORDER BY updated DESC
project = PROJ AND assignee = currentUser() AND status != Done
project = PROJ AND created >= -7d ORDER BY created DESC
```

---

## Requirements

### Query Requirements
- [ ] JQL is valid and optimized
- [ ] Proper field selection (GET fields)
- [ ] Pagination handled
- [ ] Results limited appropriately

### Create Requirements
- [ ] Required fields provided
- [ ] Issue type is valid
- [ ] Project key is correct
- [ ] Permissions verified

### Update Requirements
- [ ] Issue exists
- [ ] User has permission
- [ ] Valid transition
- [ ] Field is editable

### Rate Limits
- [ ] Cloud: 10 requests/second
- [ ] Handle 429 responses
- [ ] Implement retry logic

---

## Output Format

```markdown
## Jira Connector Result

### Action
- **Type**: [Fetch/Create/Update/Transition]
- **Target**: [Issue key or Project]
- **Timestamp**: [ISO 8601]

### Request
```
Method: GET/POST/PUT
Endpoint: /rest/api/3/issue
Query: /search?jql=project%3DPROJ
Body: {
  "fields": {
    "project": { "key": "PROJ" },
    "summary": "Issue title",
    "issuetype": { "name": "Task" }
  }
}
```

### Response
- **Status**: [HTTP status]
- **Issues Found**: [Count]
- **Data**:
| Key | Summary | Status | Assignee |
|-----|---------|--------|----------|
| PROJ-123 | Task title | In Progress | john@email |

### Issues
- [ ] None / [Error details]

### Changes Made
- Created: PROJ-124
- Updated: PROJ-123 (status → In Progress)
- Commented: PROJ-122

### Next Steps
- [ ] Review issue in Jira
- [ ] Assign to team member
- [ ] Add to sprint
```

---

## Checkpoint Verification

- [ ] Authentication successful
- [ ] Correct project accessed
- [ ] Issues retrieved/created successfully
- [ ] Permissions verified
- [ ] Rate limits respected

---

## Common Jira Integration Issues

### 1. Permission Denied
- Check user has Browse Projects permission
- Verify issue security level

### 2. Invalid Transition
- Verify transition ID exists
- Check issue is in correct status

### 3. Field Not Editable
- Check field is not readonly
- Verify field is on screen

### 4. Rate Limiting
- Implement exponential backoff
- Cache frequently accessed data
