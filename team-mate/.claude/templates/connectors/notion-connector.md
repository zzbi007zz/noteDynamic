# Notion Connector Template

**Type:** Connector (Zero-Friction Integration)
**Purpose:** Integrate with Notion for documentation, databases, and knowledge management
**Workflow:** Parallel - can run with other connectors

---

## Role Overview

As a Notion Connector, your role is to integrate directly with Notion's API to fetch, create, and update pages, databases, and content. This connector provides real-time access to your team's documentation and knowledge base, replacing the need for manual file syncing.

---

## Context

### Notion Workspace
- **Workspace**: [Workspace name]
- **Authentication**: [OAuth / Integration Token]
- **Version**: [Notion API version]

### Target
- **Database ID**: [For database operations]
- **Page ID**: [For page operations]
- **Block IDs**: [For specific blocks]

### Content Types
- **Databases**: [Project tracking, docs, etc.]
- **Pages**: [Documentation, meeting notes]
- **Blocks**: [Text, code, embeddings]

---

## Task

### Primary Objective
Perform [specific Notion action] on [target]

### Use Cases

#### 1. Fetch Pages
- Get page content
- Get page properties
- Get page metadata
- Search pages

#### 2. Query Databases
- Query with filters
- Query with sorts
- Query with pagination
- Get database schema

#### 3. Create Content
- Create new page
- Create database entry
- Add blocks to page
- Create database

#### 4. Update Content
- Update page properties
- Update block content
- Add/remove blocks
- Archive pages

---

## Notion API Integration

### Authentication
```typescript
// Using Integration Token
const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
};
```

### Common Endpoints

| Action | Endpoint | Method |
|--------|----------|--------|
| Search | /v1/search | POST |
| Get Page | /v1/pages/{page_id} | GET |
| Get Block Children | /v1/blocks/{block_id}/children | GET |
| Query Database | /v1/databases/{database_id}/query | POST |
| Create Page | /v1/pages | POST |
| Update Page | /v1/pages/{page_id} | PATCH |
| Create Block | /v1/blocks/{block_id}/children | POST |

### Block Types
```typescript
// Text block
{ type: 'paragraph', paragraph: { rich_text: [{ text: { content: 'Text' } }] } }

// Heading
{ type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Heading' } }] } }

// Code block
{ type: 'code', code: { language: 'typescript', rich_text: [{ text: { content: 'code' } }] } }

// To-do
{ type: 'to_do', to_do: { rich_text: [{ text: { content: 'Task' } }], checked: false } }
```

---

## Requirements

### Query Requirements
- [ ] Database ID is correct
- [ ] Filters are valid
- [ ] Pagination handled
- [ ] Properties exist

### Create Requirements
- [ ] Parent is valid (page or database)
- [ ] Required properties provided
- [ ] Property types match

### Update Requirements
- [ ] Page/block exists
- [ ] Properties are editable
- [ ] Property types match

### Rate Limits
- [ ] 3 requests per second
- [ ] Handle 429 responses
- [ ] Implement retry logic

---

## Output Format

```markdown
## Notion Connector Result

### Action
- **Type**: [Fetch/Create/Update/Query]
- **Target**: [Page/Database name]
- **Timestamp**: [ISO 8601]

### Request
```
Method: GET/POST/PATCH
Endpoint: /v1/databases/{id}/query
Body: {
  "filter": {
    "property": "Status",
    "status": { "equals": "In Progress" }
  },
  "sorts": [{ "property": "Name", direction: "ascending" }]
}
```

### Response
- **Status**: [HTTP status]
- **Results**: [Count]
- **Has More**: [true/false]

### Content Retrieved
| Page | Status | Last Edited |
|------|--------|-------------|
| Doc Name | In Progress | 2024-01-15 |

### Data Structure
```
Page: [Page Title]
├── Properties
│   ├── Name: [Title]
│   ├── Status: [Select]
│   └── Date: [Date]
└── Blocks
    ├── Heading 1: [Title]
    ├── Paragraph: [Content]
    └── Code: [Code block]
```

### Errors
- [ ] None / [Error details]

### Changes Made
- Created: [Page name]
- Updated: [Page name] - Status → Done
- Added: [X] blocks to [Page]

### Next Steps
- [ ] Review in Notion
- [ ] Add more content
- [ ] Share with team
```

---

## Checkpoint Verification

- [ ] Authentication successful
- [ ] Correct page/database accessed
- [ ] Content retrieved/created successfully
- [ ] Properties properly mapped
- [ ] Rate limits respected

---

## Common Notion Integration Issues

### 1. Permission Error
- Integration must be shared with page/database
- Check sharing settings

### 2. Invalid Property
- Property name or type doesn't match
- Check database schema

### 3. Rate Limiting
- Implement exponential backoff
- Batch requests when possible

### 4. Block Limitations
- Some blocks have max content size
- Rich text has character limits
