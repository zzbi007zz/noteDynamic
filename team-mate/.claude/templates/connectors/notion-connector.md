# Notion Connector Template

**Type:** Connector
**Purpose:** Integrate with Notion for documentation

---

## Context

[Notion workspace, database ID, page ID]

## Task

[Describe the Notion action needed]

Examples:
- Fetch page [PAGE_ID] content
- Query database [DATABASE_ID]
- Create new page in [DATABASE]
- Update page [PAGE_ID] properties

## Requirements

1. Use Notion API
2. Parse block content
3. Handle rate limits
4. Preserve formatting

## Output Format

```
## Notion Connector Result

### Action
[What was done]

### Content
[Extracted content]

### Page Info
- Title: [Title]
- Last Edited: [Date]

### Errors
[Any errors]
```
