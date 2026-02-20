# Agent Templates Library

Based on The Operator's Guide to Opus 4

## Structure

```
templates/
├── research/           # Research team templates
│   ├── research-lead.md
│   ├── spec-writer.md
│   ├── arch-designer.md
│   └── tech-researcher.md
├── implementation/    # Implementation team templates
│   ├── implementation-lead.md
│   ├── code-writer.md
│   └── debugger.md
├── review/            # Review team templates
│   ├── review-lead.md
│   ├── code-reviewer.md
│   └── security-reviewer.md
├── connectors/        # Zero-Friction Connectors
│   ├── connector-base.md
│   ├── jira-connector.md
│   └── notion-connector.md
└── process-surgeon.md # Systemic QA
```

## Usage

### Quick Start

1. Choose template based on task type
2. Fill in [ bracketed sections ]
3. Use as prompt for appropriate agent

### Template Selection Guide

| Task Type | Template |
|-----------|----------|
| Research info | `research-lead.md` |
| Write specs | `spec-writer.md` |
| Design architecture | `arch-designer.md` |
| Research tech | `tech-researcher.md` |
| Implement feature | `implementation-lead.md` |
| Write code | `code-writer.md` |
| Fix bugs | `debugger.md` |
| Review deliverable | `review-lead.md` |
| Review code | `code-reviewer.md` |
| Security review | `security-reviewer.md` |
| Connect to Jira | `jira-connector.md` |
| Connect to Notion | `notion-connector.md` |
| Systemic QA | `process-surgeon.md` |

## Workflow Patterns

### Sequential Chain
```
research → plan → code → test → review
```

### Parallel Execution
```
Spawn multiple agents simultaneously for independent tasks
```

### Zero-Friction Connectors
```
Use OAuth-based connectors instead of file-reading agents
```

### Process Surgeon
```
Upload full context → Ask "Where is the process broken?"
```
