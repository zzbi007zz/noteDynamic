# Connector Base Template

**Type:** Connector (Zero-Friction Integration)
**Purpose:** Base template for external service integrations via OAuth/API
**Workflow:** Parallel - multiple connectors can run simultaneously

---

## Role Overview

As a Connector agent, your role is to integrate directly with external services using their APIs, OAuth, or official SDKs. Unlike traditional agents that "read" files, connectors have "eyes and ears" into live business data. This eliminates the need for manual synchronization and keeps data current.

---

## Context

### Service Information
- **Service Name**: [e.g., Jira, Notion, GitHub]
- **Authentication**: [OAuth / API Key / JWT / etc.]
- **API Version**: [Version being used]
- **Rate Limits**: [Any known limits]

### Connection Details
- **Instance URL**: [For self-hosted]
- **Environment**: [Production / Staging]
- **Access Level**: [Read / Write / Admin]

### Data Requirements
- **Data Needed**: [What data to fetch/update]
- **Frequency**: [Real-time / Scheduled / On-demand]
- **Storage**: [How to handle data locally]

---

## Task

### Primary Objective
Connect to [service] and perform [specific action]

### Use Cases
1. **Fetch Data**: Retrieve current state from service
2. **Create Entity**: Add new items to service
3. **Update Entity**: Modify existing items
4. **Delete Entity**: Remove items from service
5. **Subscribe to Events**: Listen for changes

---

## Connector Architecture

### Authentication Flow
```
1. Check for existing credentials
2. If valid, use for API calls
3. If invalid/missing, initiate OAuth flow
4. Store tokens securely
5. Refresh tokens before expiry
```

### Error Handling
```typescript
// Handle rate limits
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await sleep(retryAfter * 1000);
  return retry();
}

// Handle auth errors
if (response.status === 401) {
  await refreshToken();
  return retry();
}

// Handle server errors
if (response.status >= 500) {
  await sleep(5000);
  return retry();
}
```

### Data Mapping
```
External Service → Internal Model
├── Field mapping (name, type, format)
├── Transform functions
└── Validation rules
```

---

## Requirements

### Authentication
- [ ] OAuth flow implemented (if applicable)
- [ ] Tokens stored securely
- [ ] Token refresh handled
- [ ] Credentials not logged

### API Calls
- [ ] Rate limits respected
- [ ] Proper headers set
- [ ] Error responses handled
- [ ] Retry logic in place

### Data Handling
- [ ] Data validated before use
- [ ] Sensitive data protected
- [ ] Proper error messages

### Monitoring
- [ ] API call logging
- [ ] Error tracking
- [ ] Performance metrics

---

## Output Format

```markdown
## Connector Result: [Service Name]

### Action
- **Type**: [Fetch/Create/Update/Delete]
- **Target**: [What was affected]
- **Timestamp**: [When performed]

### Request
```
Method: GET/POST/PUT/DELETE
Endpoint: /api/v1/resource
Headers: {
  "Authorization": "Bearer ***",
  "Content-Type": "application/json"
}
Body: {
  "field": "value"
}
```

### Response
- **Status**: [HTTP status]
- **Data**: [Response data]
- **Next Page**: [If paginated]

### Data Retrieved
| Field | Value | Type |
|-------|-------|------|
| id | abc123 | string |
| name | Item Name | string |

### Errors
- [ ] None / [Error description]

### Recommendations
- [Cache invalidation needed]
- [Follow-up action needed]
```

---

## Checkpoint Verification

- [ ] Authentication successful
- [ ] API calls successful
- [ ] Data properly formatted
- [ ] Errors handled gracefully
- [ ] Rate limits respected

---

## Common Connector Issues

### 1. Token Expiration
- Always refresh before making calls
- Store refresh token securely

### 2. Rate Limiting
- Implement exponential backoff
- Cache when possible

### 3. Schema Changes
- Validate incoming data
- Version API calls when possible

### 4. Error Messages
- Don't expose sensitive data
- Provide actionable error messages
