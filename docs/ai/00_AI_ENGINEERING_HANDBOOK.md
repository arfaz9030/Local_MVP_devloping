# 00_AI_ENGINEERING_HANDBOOK.md

> **Engineering Constitution for the CrickHero Project**

Version: **2.0**

Status: **Active**

Owner: **Project Architecture**

Review Cycle: **Quarterly**

Last Reviewed: **2026-08-03**

Approved By: **Project Architect / Engineering Lead**


Applies To:

- Frontend Development
- Backend Development
- Full Stack Development
- Documentation
- Code Review
- Debugging
- Testing
- AI-Assisted Development

---

# Version History

| Version | Status | Summary |
|----------|--------|---------|
| 1.0 | Released | Initial Engineering Handbook |
| 2.0 | Active | Refactored structure, improved navigation, reduced duplication, added cross-references and AI Operating Model |

---
## Changelog

### Version 2.0

- Refactored handbook structure
- Added AI Operating Model
- Added Engineering Rules
- Added Quality Gates
- Added AI Decision Framework
- Reduced duplicate guidance
- Introduced cross-references

## Design Goal

This handbook defines the engineering governance for the CrickHero project.

It intentionally avoids implementation-specific guidance.

Implementation details belong in the project's specialized documents.

- API_CONTRACT.md
- FRONTEND_GUIDELINES.md
- BACKEND_GUIDELINES.md
- UI_DESIGN_SYSTEM.md
- CODING_STANDARDS.md
- CURRENT_STATUS.md
- DECISIONS.md

The purpose of this handbook is to establish engineering principles, AI operating standards, workflows, quality gates, and governance that remain stable throughout the project's lifecycle.

---


# Table of Contents

## Part I — Engineering Foundation

1. Purpose
2. Scope
3. Target Audience
4. Engineering Philosophy
5. Documentation Architecture
6. Document Responsibilities
7. Document Priority

## Required Reading Order

Every AI assistant should follow this order:

1. Engineering Handbook
2. Relevant Guideline
3. API Contract (if applicable)
4. Existing Implementation
5. Requested Task

## Part II — AI Operating Model

8. AI Operating Model

- AI Operating Principles
- AI Task Router
- AI Startup Checklist

(See subsequent parts for Development Workflows, Engineering Rules, Quality Gates, AI Operating Manual, Reference Guides and Engineering Principles.)

---

# Part I — Engineering Foundation

---

# 1. Purpose

The Engineering Handbook is the governance document for the CrickHero project.

It establishes:

- Engineering principles
- AI operating standards
- Development workflows
- Documentation governance
- Document precedence
- Engineering quality expectations

This handbook **does not replace** the remaining project documentation.

Instead, it defines:

- which document owns each topic,
- which document is authoritative,
- how AI assistants should navigate the documentation,
- and how engineering work should be executed consistently.

Implementation details remain within their dedicated project documents.

---

# 2. Scope

This handbook applies to every engineering activity performed within the project, including:

- Frontend Development
- Backend Development
- Full Stack Development
- Feature Implementation
- API Integration
- Authentication
- Debugging
- Refactoring
- Testing
- Code Review
- Documentation
- Architecture

It also applies to every AI coding assistant used on the project, including but not limited to:

- ChatGPT
- Google AI Studio
- Gemini
- Claude
- Cursor
- Windsurf
- GitHub Copilot
- DeepSeek
- Perplexity
- Future AI coding assistants

---

# 3. Target Audience

This handbook is intended for:

- Software Engineers
- Frontend Developers
- Backend Developers
- Full Stack Developers
- Technical Leads
- Software Architects
- QA Engineers
- Code Reviewers
- AI Coding Assistants
- Future contributors

---

# 4. Engineering Philosophy

Every engineering decision should align with the following principles.

## Simplicity First

Choose the simplest solution that satisfies the requirement.

Avoid unnecessary abstractions and over-engineering.

---

## MVP First

Deliver working functionality before optimization or enhancement.

---

## Reuse Before Create

Before creating new code, inspect the existing project for reusable:

- Components
- Hooks
- Services
- Utilities
- Models
- DTOs
- Configuration

Prefer extension over duplication.

---

## Preserve Architecture

Respect the existing project architecture.

Architectural changes must be intentional, documented and approved through:

```
DECISIONS.md
```

---

## Minimum Safe Change

Implement only the requested change.

Avoid:

- unnecessary refactoring,
- unrelated modifications,
- hidden feature additions,
- architecture rewrites.

Small, reviewable changes reduce regression risk.

---

## Documentation-Driven Development

Project documentation is the primary engineering reference.

AI should use project documentation first and official library documentation only when project documentation does not define the required behavior.

---

# 5. Documentation Architecture

The documentation is intentionally divided into specialized documents.

Each document owns a single engineering responsibility.

```
Engineering Handbook
        │
        ├── Project Overview
        ├── AI Project Context
        ├── Current Status
        ├── API Contract
        ├── Frontend Guidelines
        ├── Backend Guidelines
        ├── UI Design System
        ├── Coding Standards
        ├── Architecture Decisions
        ├── Master Checklist
        ├── Roadmap
        ├── Git Workflow
        ├── AI Prompts
        └── AI Mentor System Prompt
```

The Engineering Handbook provides governance.

All implementation details remain inside the specialized documents.

---

# 6. Document Responsibilities

Every project document has one clearly defined responsibility.

Avoid duplicating information across multiple documents.

---

## PROJECT_OVERVIEW.md

Purpose

High-level understanding of the project.

Contains

- Vision
- Scope
- Technology Stack
- High-Level Architecture
- Product Direction

---

## AI_PROJECT_CONTEXT.md

Purpose

Permanent project context shared across AI sessions.

Contains

- Business context
- Stable project information
- Long-term assumptions

---

## CURRENT_STATUS.md

Purpose

Current development progress.

Contains

- Completed work
- Active work
- Pending work
- Known blockers

---

## API_CONTRACT.md

Purpose

Single source of truth for backend communication.

Contains

- Endpoints
- Request models
- Response models
- Validation rules
- HTTP methods

No API implementation should contradict this document.

---

## FRONTEND_GUIDELINES.md

Purpose

Frontend engineering standards.

Contains

- React Native architecture
- Expo Router conventions
- Component guidelines
- UI implementation rules
- Frontend workflow

---

## BACKEND_GUIDELINES.md

Purpose

Backend engineering standards.

Contains

- Spring Boot architecture
- Controllers
- Services
- Repositories
- Security
- Backend implementation rules

---

## UI_DESIGN_SYSTEM.md

Purpose

Visual consistency.

Contains

- Color tokens
- Typography
- Spacing
- Radius
- Elevation
- Design tokens

---

## CODING_STANDARDS.md

Purpose

Code quality standards.

Contains

- Naming conventions
- Formatting
- Logging standards
- File organization
- Best practices

---

## DECISIONS.md

Purpose

Approved architectural decisions.

Any architectural change should be documented here.

---

## MASTER_CHECKLIST.md

Purpose

Track feature completion.

Contains

- Completed items
- Pending items
- Delivery tracking

---

## ROADMAP.md

Purpose

Future planning.

Contains

- Planned enhancements
- Future milestones
- Product direction

---

## GIT_WORKFLOW.md

Purpose

Version control standards.

Contains

- Branch strategy
- Commit conventions
- Merge workflow

---

## AI_PROMPTS.md

Purpose

Reusable prompts for engineering tasks.

---

## AI_MENTOR_SYSTEM_PROMPT.md

Purpose

Optional teaching and mentoring resource.

Used only when learning or detailed explanations are requested.

It does not replace engineering standards.

---

# 7. Document Priority Order

When multiple documents appear to conflict, resolve them using the following order of precedence.

| Priority | Document |
|----------|----------|
| 1 | Latest explicit user instruction |
| 2 | 00_AI_ENGINEERING_HANDBOOK.md |
| 3 | API_CONTRACT.md |
| 4 | DECISIONS.md |
| 5 | FRONTEND_GUIDELINES.md / BACKEND_GUIDELINES.md |
| 6 | UI_DESIGN_SYSTEM.md |
| 7 | CODING_STANDARDS.md |
| 8 | CURRENT_STATUS.md |
| 9 | MASTER_CHECKLIST.md |
| 10 | ROADMAP.md |
| 11 | PROJECT_OVERVIEW.md |
| 12 | AI_PROJECT_CONTEXT.md |
| 13 | AI_PROMPTS.md |
| 14 | AI_MENTOR_SYSTEM_PROMPT.md |

When uncertainty exists, always follow the higher-priority document.

---

End of Pass 1A

# Document Change Policy

Before modifying any project document:

1. Identify the owning document.
2. Avoid duplicating information.
3. Update only the owning document.
4. Update cross-references if ownership changes.
5. Keep governance separate from implementation.

# Part II — AI Operating Model

The AI Operating Model defines how every AI assistant should work within the CrickHero project.

It provides a consistent process for:

- Understanding requests
- Selecting project documentation
- Planning implementation
- Generating code
- Reviewing changes
- Maintaining engineering quality

This operating model applies to all AI coding assistants supported by the project.

---

# 8. AI Operating Model

Every engineering request should follow the same execution lifecycle.

```
User Request
        │
        ▼
Understand Requirement
        │
        ▼
Classify Task
        │
        ▼
Identify Required Documents
        │
        ▼
Review Existing Implementation
        │
        ▼
Impact Analysis
        │
        ▼
Implementation Plan
        │
        ▼
Generate Minimum Safe Change
        │
        ▼
Self Review
        │
        ▼
Definition of Done
        │
        ▼
Ready for Review
```

This workflow applies to every engineering task regardless of project size.

---

## 8.1 AI Operating Principles

Every AI assistant working on this project must follow these principles.

### Understand Before Implementing

Understand the business requirement before writing code.

Never assume intent.

---

### Read Before Writing

Read:

- Engineering Handbook
- Relevant project documents
- Existing implementation

before generating code.

---

### Reuse Before Creating

Search the existing project for reusable:

- Components
- Services
- Hooks
- Utilities
- Models
- Configuration

Reuse whenever practical.

---

### Preserve Architecture

Respect existing project architecture.

Do not introduce architectural changes unless explicitly instructed or approved.

---

### Make the Minimum Safe Change

Modify only what is required to satisfy the requested task.

Avoid:

- unnecessary refactoring
- unrelated changes
- hidden feature additions

---

### Documentation First

Project documentation is the primary engineering reference.

Use official framework documentation only when project documentation does not define the required behavior.

---

### Self Review

Every implementation should be reviewed before completion.

Verify:

- Architecture
- API Contract
- Coding Standards
- Existing functionality
- Regression risk

---

## 8.2 AI Task Classification

Every request should first be classified.

| Task Type | Primary Documents |
|------------|-------------------|
| Frontend | FRONTEND_GUIDELINES.md, UI_DESIGN_SYSTEM.md |
| Backend | BACKEND_GUIDELINES.md, API_CONTRACT.md |
| Full Stack | Frontend + Backend + API Contract |
| Debugging | CURRENT_STATUS.md, Relevant Guidelines |
| Code Review | CODING_STANDARDS.md, Relevant Guidelines |
| Documentation | Existing Document, MASTER_CHECKLIST.md |
| Architecture | DECISIONS.md, Engineering Handbook |
| Testing | Definition of Done, Testing Expectations |

Task classification determines which project documents must be reviewed before implementation begins.

---

## 8.3 AI Document Routing

After identifying the task type, review only the required documentation.

### Frontend

Read:

- Engineering Handbook
- FRONTEND_GUIDELINES.md
- UI_DESIGN_SYSTEM.md
- API_CONTRACT.md (if backend communication is required)

---

### Backend

Read:

- Engineering Handbook
- BACKEND_GUIDELINES.md
- API_CONTRACT.md

---

### Full Stack

Read:

- Engineering Handbook
- FRONTEND_GUIDELINES.md
- BACKEND_GUIDELINES.md
- API_CONTRACT.md
- UI_DESIGN_SYSTEM.md

---

### Debugging

Read:

- Engineering Handbook
- CURRENT_STATUS.md
- Relevant guideline document
- DECISIONS.md (if architectural behavior is involved)

---

### Documentation

Read:

- Engineering Handbook
- Existing document
- MASTER_CHECKLIST.md
- CURRENT_STATUS.md

Update only the affected documentation.

---

## 8.4 AI Startup Checklist

Before generating code, verify the following:

### Requirement

☐ Requirement understood

☐ Acceptance criteria identified

☐ Task classified

---

### Documentation

☐ Required documents reviewed

☐ Existing implementation reviewed

☐ API requirements confirmed

☐ Architecture confirmed

---

### Planning

☐ Affected files identified

☐ Impact analysis completed

☐ Implementation plan prepared

---

### Implementation

☐ Minimum safe change selected

☐ Existing implementation reused

☐ No unnecessary refactoring planned

---

### Review

☐ Self review completed

☐ Definition of Done satisfied

☐ Documentation updates identified

---

## 8.5 AI Escalation Rules

Do not guess when critical information is missing.

Pause implementation and request clarification when:

- API behavior is undocumented.
- Authentication behavior is unclear.
- Existing implementation cannot be located.
- Multiple valid interpretations exist.
- Architecture changes are requested.
- Required documentation is missing.

Whenever escalation occurs:

1. Explain what information is missing.
2. Explain why it is required.
3. Recommend the appropriate project document for clarification or update.

---

## 8.6 AI Response Standard

Every implementation request should follow this structure whenever practical.

1. Requirement Understanding

2. Task Classification

3. Documents Reviewed

4. Existing Implementation Review

5. Impact Analysis

6. Implementation Plan

7. Code Generation

8. Self Review

9. Risks

10. Documentation Updates

11. Next Steps

This response structure promotes consistency across all AI coding assistants.

---

## Cross References

For implementation workflows, see:

- Part III — Development Workflows

For mandatory engineering rules, see:

- Part IV — Engineering Rules

For quality validation, see:

- Part V — Quality Gates

For AI response templates and reusable prompts, see:

- Part VI — AI Operating Manual

---

End of Part II — AI Operating Model
# Part III — Development Workflows

This part defines the standard engineering workflows used throughout the CrickHero project.

These workflows describe **how work progresses** from requirement to completion.

Detailed engineering rules are defined in:

- Part IV — Engineering Rules
- Part V — Quality Gates

These workflows should be followed together with the AI Operating Model.

---

# 9. Development Workflow Overview

Every engineering task follows the same high-level lifecycle.

```
Requirement
        │
        ▼
Task Classification
        │
        ▼
Documentation Review
        │
        ▼
Existing Implementation Review
        │
        ▼
Impact Analysis
        │
        ▼
Implementation Plan
        │
        ▼
Implementation
        │
        ▼
Self Review
        │
        ▼
Testing
        │
        ▼
Documentation Update
        │
        ▼
Definition of Done
```

The remaining sections specialize this workflow for different engineering activities.

---

# 10. Frontend Development Workflow

Use this workflow for:

- New screens
- UI enhancements
- Component development
- Navigation
- API integration
- State management

## Workflow

```
Requirement
        │
        ▼
Review

• FRONTEND_GUIDELINES.md
• UI_DESIGN_SYSTEM.md

        │
        ▼
Review Existing Components

        │
        ▼
Review Existing Hooks

        │
        ▼
Review Existing Services

        │
        ▼
Implementation Plan

        │
        ▼
Implementation

        │
        ▼
Testing

        │
        ▼
Documentation Update
```

Refer to:

- Part IV — Engineering Rules
- Part V — Quality Gates

for mandatory engineering requirements.

---

# 11. Backend Development Workflow

Use this workflow for:

- APIs
- Business Logic
- Authentication
- Database
- Services

## Workflow

```
Requirement
        │
        ▼
Review

• BACKEND_GUIDELINES.md
• API_CONTRACT.md

        │
        ▼
Review Existing Controllers

        │
        ▼
Review Existing Services

        │
        ▼
Review Existing Repository

        │
        ▼
Implementation Plan

        │
        ▼
Implementation

        │
        ▼
Testing

        │
        ▼
Documentation Update
```

Mandatory engineering rules are defined in Part IV.

---

# 12. Full Stack Feature Workflow

Use this workflow whenever a feature affects both frontend and backend.

## Workflow

```
Requirement
        │
        ▼
Impact Analysis

        │
        ▼
Identify Affected Layers

        │
        ▼
Frontend

Backend

API

Authentication

Documentation

        │
        ▼
Review Required Documents

        │
        ▼
Implementation Plan

        │
        ▼
Frontend Implementation

        │
        ▼
Backend Implementation

        │
        ▼
Integration Testing

        │
        ▼
Documentation Update
```

The objective is to maintain consistency across all affected layers.

---

# 13. Debugging Workflow

Never implement a fix before identifying the root cause.

## Workflow

```
Issue Report

        │
        ▼
Reproduce

        │
        ▼
Collect Evidence

        │
        ▼
Inspect Existing Implementation

        │
        ▼
Root Cause Analysis

        │
        ▼
Confirm Root Cause

        │
        ▼
Implement Fix

        │
        ▼
Regression Testing

        │
        ▼
Documentation Update (if required)
```

Debugging should solve the underlying cause rather than only the visible symptom.

---

# 14. Code Review Workflow

Every implementation should undergo review before completion.

## Workflow

```
Implementation

        │
        ▼
Architecture Review

        │
        ▼
API Review

        │
        ▼
Coding Standards Review

        │
        ▼
Security Review

        │
        ▼
Performance Review

        │
        ▼
Documentation Review

        │
        ▼
Approval
```

Reviewers should evaluate only the affected implementation and avoid introducing unrelated changes.

---

# 15. Refactoring Workflow

Refactoring should improve maintainability without changing behaviour.

## Workflow

```
Identify Opportunity

        │
        ▼
Assess Risk

        │
        ▼
Review Existing Architecture

        │
        ▼
Minimal Refactoring

        │
        ▼
Regression Testing

        │
        ▼
Documentation Update (if required)
```

Refactoring should remain incremental and low risk.

---

# 16. Documentation Workflow

Documentation should evolve alongside implementation.

Whenever project behaviour changes:

Determine which project documents are affected.

Examples:

| Change | Document |
|----------|----------|
| API | API_CONTRACT.md |
| UI Pattern | UI_DESIGN_SYSTEM.md |
| Frontend Standards | FRONTEND_GUIDELINES.md |
| Backend Standards | BACKEND_GUIDELINES.md |
| Architecture | DECISIONS.md |
| Progress | CURRENT_STATUS.md |
| Feature Completion | MASTER_CHECKLIST.md |
| Future Work | ROADMAP.md |

Update only the documents impacted by the change.

---

# 17. Git Workflow Integration

Every engineering task should align with the project's Git workflow.

```
Requirement

        │
        ▼
Implementation

        │
        ▼
Testing

        │
        ▼
Documentation

        │
        ▼
Commit

        │
        ▼
Push

        │
        ▼
Pull Request

        │
        ▼
Review

        │
        ▼
Merge
```

Refer to:

GIT_WORKFLOW.md

for branching strategy, commit conventions and repository standards.

---

End of Part III — Development Workflows
# Part IV — Engineering Rules

This part defines the mandatory engineering rules for the CrickHero project.

These rules are the **single source of truth** for engineering practices.

All other parts of this handbook should reference these rules instead of repeating them.

The following terminology is used throughout this handbook:

| Keyword | Meaning |
|----------|---------|
| **MUST** | Mandatory requirement |
| **MUST NOT** | Prohibited action |
| **SHOULD** | Strong recommendation |
| **MAY** | Optional recommendation based on context |

---

# 19. Engineering Fundamentals

These rules apply to every engineering activity.

---

## 19.1 Read Before Writing

Every implementation MUST begin with understanding the existing project.

Before writing code:

- Read the Engineering Handbook.
- Determine the task category.
- Read the required project documents.
- Review the existing implementation.

Never generate code without understanding the project context.

---

## 19.2 Reuse Before Create

Existing implementations MUST always be reviewed before creating new ones.

Inspect existing:

- Components
- Hooks
- Services
- Utilities
- Models
- DTOs
- Configuration

SHOULD reuse existing implementation whenever possible.

MUST NOT duplicate functionality without justification.

---

## 19.3 Preserve Architecture

The existing architecture MUST be preserved.

Architectural changes require:

- Explicit user instruction, or
- An approved decision documented in DECISIONS.md.

MUST NOT introduce architectural changes as part of unrelated work.

---

## 19.4 Minimum Safe Change

Every implementation MUST modify only what is necessary.

Avoid:

- Large rewrites
- Hidden enhancements
- Unrelated refactoring
- Unnecessary optimizations

Small, isolated changes reduce regression risk.

---

## 19.5 Existing Functionality

New work MUST preserve:

- Existing features
- Existing APIs
- Existing navigation
- Existing business logic

No completed functionality should regress because of unrelated changes.

---

## 19.6 Documentation First

Project documentation is the primary engineering reference.

If project documentation defines behaviour:

MUST follow it.

Only consult official framework documentation when project documentation does not define the required behaviour.

---

## 19.7 Official Documentation

When verification is required, use official documentation for:

- Java
- Spring Boot
- Spring Security
- JavaScript
- TypeScript
- React
- React Native
- Expo
- Expo Router
- React Native Paper

Never rely solely on AI memory.

---

# 20. API & Integration Rules

API_CONTRACT.md is the authoritative source for all API communication.

---

## 20.1 API Contract

Every implementation MUST follow API_CONTRACT.md exactly.

---

## 20.2 API Consistency

MUST use:

- Existing endpoints
- Existing request models
- Existing response models
- Existing validation rules
- Existing HTTP methods

---

## 20.3 Prohibited Actions

MUST NOT invent:

- APIs
- Endpoints
- Request fields
- Response fields
- Headers
- Query parameters
- Error formats

---

## 20.4 Missing APIs

If an API is missing:

1. Inform the developer.
2. Recommend updating API_CONTRACT.md.
3. Wait for approval.

Do not invent missing APIs.

---

## 20.5 API Changes

Whenever an API changes, determine whether these documents require updates:

- API_CONTRACT.md
- CURRENT_STATUS.md
- MASTER_CHECKLIST.md

---

# 21. Security & Authentication Rules

Authentication and security are critical engineering concerns.

---

## 21.1 Authentication

Authentication logic MUST remain centralized.

MUST NOT duplicate authentication logic.

---

## 21.2 JWT

MUST NOT:

- Hardcode JWT tokens
- Log JWT tokens
- Modify JWT payloads
- Change expiration behaviour
- Change authentication flow

Unless explicitly approved.

---

## 21.3 Authorization

Authorization MUST always be verified on the server.

Never rely solely on client-side validation.

---

## 21.4 Protected Endpoints

Protected APIs MUST:

- Validate authentication
- Validate authorization
- Validate request data

before business logic executes.

---

## 21.5 Logout

Logout MUST:

- Clear authentication state
- Remove cached credentials
- Prevent unauthorized access

---

# 22. Code Quality Rules

Refer to CODING_STANDARDS.md for detailed implementation guidance.

These principles are mandatory.

---

## 22.1 Readability

Code SHOULD be:

- Simple
- Predictable
- Maintainable

---

## 22.2 Naming

Use meaningful names.

Avoid abbreviations unless they are industry standard.

---

## 22.3 Type Safety

Prefer explicit typing.

Avoid `any` unless unavoidable.

---

## 22.4 Single Responsibility

Each component, service, hook or class SHOULD have one clear responsibility.

---

## 22.5 Comments

Comments SHOULD explain:

Why

instead of

What.

---

## 22.6 Clean Code

Remove:

- Dead code
- Unused imports
- Obsolete comments
- Duplicate logic

before completion.

---

# 23. Logging & Observability Rules

Logging exists to support diagnosis and monitoring.

---

## 23.1 Appropriate Logging

Log:

- Errors
- Warnings
- Important business events
- Temporary debugging information

when appropriate.

---

## 23.2 Sensitive Information

MUST NOT log:

- Passwords
- JWT Tokens
- OTP values
- API Keys
- Personal information
- Secrets

---

## 23.3 Temporary Logs

Debug logging SHOULD be removed before final delivery.

---

## 23.4 Log Quality

Logs SHOULD clearly explain:

- What happened
- Where it happened
- Why it happened (if known)

---

# 24. Error Handling Rules

Errors should be handled consistently across the application.

---

## 24.1 Frontend

Provide:

- Loading state
- Error state
- Retry option (where appropriate)

Never expose backend implementation details.

---

## 24.2 Backend

Always:

- Validate input
- Return documented responses
- Handle exceptions
- Log unexpected failures

---

## 24.3 Error Messages

Messages SHOULD help users understand the problem.

MUST NOT expose:

- Stack traces
- Database details
- Internal implementation

---

## 24.4 Exception Strategy

Catch only exceptions that can be handled.

Allow centralized exception handlers to manage unexpected failures.

---

# 25. Performance Rules

Performance improvements should be evidence-based.

---

## 25.1 Frontend

SHOULD:

- Reuse components
- Avoid unnecessary renders
- Optimize after measurement

---

## 25.2 Backend

SHOULD:

- Use efficient queries
- Use pagination where appropriate
- Cache only when justified

---

## 25.3 APIs

Avoid:

- Duplicate requests
- Over-fetching
- Under-fetching

Return only required information.

---

## 25.4 Optimization

Measure before optimizing.

Maintainability always takes precedence over premature optimization.

---

# 26. Cross References

To avoid duplication, other parts of this handbook should reference this section.

Examples:

Instead of repeating:

"Never invent APIs"

Reference:

**Section 20 – API & Integration Rules**

---

Instead of repeating:

"Reuse existing code"

Reference:

**Section 19.2 – Reuse Before Create**

---

Instead of repeating:

"Preserve architecture"

Reference:

**Section 19.3 – Preserve Architecture**

---

Instead of repeating:

"Minimum safe change"

Reference:

**Section 19.4 – Minimum Safe Change**

---

Instead of repeating:

"Follow coding standards"

Reference:

**Section 22 – Code Quality Rules**

---

Instead of repeating:

"Protect authentication"

Reference:

**Section 21 – Security & Authentication Rules**

---

End of Part IV — Engineering Rules
# Part V — Quality Gates

Quality Gates ensure that every engineering task meets the project's quality standards before it is considered complete.

This part defines:

- Definition of Ready
- Definition of Done
- Testing Expectations
- Documentation Update Policy
- Risk Classification
- Change Impact Analysis

Mandatory engineering rules are defined in:

**Part IV — Engineering Rules**

---

# 27. Definition of Ready (DoR)

A task is considered **Ready** only when sufficient information exists for implementation.

Implementation MUST NOT begin if critical information is missing.

Refer to:

- Part II — AI Operating Model
- Part IV — Engineering Rules

---

## 27.1 Requirement Checklist

Before implementation confirm:

☐ Business requirement understood

☐ Acceptance criteria available

☐ Task category identified

☐ Relevant project documents reviewed

☐ Existing implementation inspected

☐ Required APIs identified

☐ UI requirements understood (if applicable)

☐ Architecture impact identified

☐ Dependencies understood

☐ Affected files identified

☐ Implementation plan prepared

---

## 27.2 Missing Information

If required information is unavailable:

AI MUST:

1. Explain what information is missing.
2. Explain why it is required.
3. Request clarification.
4. Recommend documentation updates when appropriate.

Never continue implementation based on assumptions.

---

# 28. Definition of Done (DoD)

Implementation is complete only after all applicable quality checks have passed.

---

## 28.1 Implementation

☐ Requested functionality completed

☐ Existing functionality preserved

☐ Architecture preserved

☐ Existing implementation reused where appropriate

---

## 28.2 Code Quality

☐ Coding Standards followed

☐ No duplicated code

☐ No dead code

☐ No unused imports

☐ No unnecessary refactoring

---

## 28.3 Frontend

(If applicable)

☐ UI verified

☐ Theme system followed

☐ Validation completed

☐ Loading state verified

☐ Error state verified

☐ Navigation verified

---

## 28.4 Backend

(If applicable)

☐ Validation completed

☐ Business logic completed

☐ Exception handling completed

☐ Authentication verified

☐ Authorization verified

---

## 28.5 API

(If applicable)

☐ API Contract followed

☐ Request model verified

☐ Response model verified

☐ Status codes verified

---

## 28.6 Documentation

Determine whether updates are required for:

☐ CURRENT_STATUS.md

☐ API_CONTRACT.md

☐ FRONTEND_GUIDELINES.md

☐ BACKEND_GUIDELINES.md

☐ UI_DESIGN_SYSTEM.md

☐ CODING_STANDARDS.md

☐ MASTER_CHECKLIST.md

☐ ROADMAP.md

---

## 28.7 Final Review

☐ Self Review completed

☐ Regression check completed

☐ Ready for testing

☐ Ready for code review

---

# 29. Testing Expectations

Testing validates that implementation behaves as expected and does not introduce regressions.

Testing scope depends on the task.

---

## 29.1 Frontend Testing

Verify:

☐ Screen renders correctly

☐ Navigation works

☐ Validation works

☐ Loading state behaves correctly

☐ Error state behaves correctly

☐ Theme consistency maintained

☐ API integration works (if applicable)

---

## 29.2 Backend Testing

Verify:

☐ Endpoint behaves correctly

☐ Validation works

☐ Business logic behaves correctly

☐ Authentication works

☐ Authorization works

☐ Exception handling works

---

## 29.3 Integration Testing

When frontend and backend are both affected verify:

☐ Request succeeds

☐ Response handled correctly

☐ Error scenarios handled

☐ Authentication flow maintained

---

## 29.4 Regression Testing

Verify the implementation has not negatively affected:

- Existing features
- Existing APIs
- Existing navigation
- Existing authentication
- Existing UI behaviour

---

# 30. Documentation Update Policy

Documentation should evolve together with implementation.

Whenever implementation changes project behaviour, determine which documents require updates.

---

## Documentation Responsibility Matrix

| Change | Update Document |
|----------|----------------|
| API | API_CONTRACT.md |
| UI Pattern | UI_DESIGN_SYSTEM.md |
| Frontend Standard | FRONTEND_GUIDELINES.md |
| Backend Standard | BACKEND_GUIDELINES.md |
| Coding Standard | CODING_STANDARDS.md |
| Architecture Decision | DECISIONS.md |
| Progress | CURRENT_STATUS.md |
| Feature Completion | MASTER_CHECKLIST.md |
| Future Planning | ROADMAP.md |

---

## Documentation Principles

Each document owns one responsibility.

Avoid duplicate documentation.

Update only affected documents.

Follow the document priority defined in:

Part I — Engineering Foundation

---

# 31. Risk Classification

Every engineering task should be classified before implementation.

Risk determines the level of review and testing required.

---

## Low Risk

Examples:

- Documentation
- UI text
- Styling adjustments

Required:

Standard review

---

## Medium Risk

Examples:

- Component updates
- Validation changes
- Screen modifications

Required:

Regression check

---

## High Risk

Examples:

- API changes
- Shared services
- Navigation
- Authentication integration

Required:

Architecture awareness

Regression testing

---

## Critical Risk

Examples:

- JWT
- Security
- Authorization
- Core architecture
- Production configuration

Required:

Security review

Architecture approval

Extensive testing

---

# 32. Change Impact Analysis

Every implementation begins with impact analysis.

Changes should never be assumed to affect only one file.

---

## Impact Checklist

Determine whether implementation affects:

☐ Frontend

☐ Backend

☐ API

☐ Authentication

☐ Database

☐ Navigation

☐ State Management

☐ Existing Components

☐ Existing Services

☐ Performance

☐ Security

☐ Documentation

---

## Change Lifecycle

```
Requirement

        │
        ▼

Impact Analysis

        │
        ▼

Affected Layers

        │
        ▼

Implementation

        │
        ▼

Testing

        │
        ▼

Documentation

        │
        ▼

Definition of Done
```

---

## AI Validation Questions

Before implementation every AI assistant should confirm:

1. What files will change?

2. Why are they changing?

3. Which project documents govern those files?

4. Which existing implementation can be reused?

5. What is the regression risk?

6. Does project documentation require updates?

Implementation should begin only after these questions have been considered.

---

## Cross References

Mandatory engineering rules:

→ Part IV — Engineering Rules

Development workflows:

→ Part III — Development Workflows

AI operating model:

→ Part II — AI Operating Model

---

End of Part V — Quality Gates
# Part VI — AI Decision Framework

This part defines how AI assistants should make engineering decisions while working on the CrickHero project.

Unlike the Engineering Rules, which define mandatory requirements, the AI Decision Framework defines the reasoning process AI should follow before generating code.

The objective is to produce engineering decisions that are:

- Consistent
- Predictable
- Maintainable
- Safe
- Reviewable

---

# 33. AI Decision Framework

Every implementation request should follow the decision process below.

```
Requirement

        │
        ▼

Understand Requirement

        │
        ▼

Review Documentation

        │
        ▼

Review Existing Implementation

        │
        ▼

Can Existing Implementation Be Reused?

        │
      ┌─┴───────────────┐
      │                 │
     YES               NO
      │                 │
      ▼                 ▼

Reuse           Is New Implementation
                Justified?

                    │
              ┌─────┴─────┐
              │           │
             YES         NO
              │           │
              ▼           ▼

Generate     Request
Code         Clarification
```

Engineering decisions should favor reuse over new implementation whenever practical.

---

# 34. AI Assumption Policy

Assumptions are one of the primary causes of incorrect AI-generated code.

Every assumption should be classified before implementation.

---

## Safe Assumptions

These assumptions have minimal engineering impact.

Examples:

- Minor spacing adjustments.
- Variable naming.
- Local formatting.

Safe assumptions MAY be made.

---

## Engineering Assumptions

These assumptions may affect implementation.

Examples:

- Existing reusable component exists.
- Existing service should be extended.

Engineering assumptions SHOULD be verified first.

---

## Unsafe Assumptions

Examples:

- New API endpoint.
- New request model.
- New response model.
- New authentication flow.
- New navigation structure.

Unsafe assumptions MUST NOT be made.

Clarification is required.

---

## Critical Assumptions

Examples:

- Security behaviour.
- Authorization.
- JWT validation.
- Production configuration.
- Database schema.

Critical assumptions are prohibited.

Implementation must pause until clarification is received.

---

# 35. AI Communication Standards

Engineering communication should be factual and evidence-based.

Avoid speculative language whenever possible.

---

## Preferred Structure

Use:

Observed

↓

Evidence

↓

Analysis

↓

Recommendation

Instead of:

"I think..."

"Maybe..."

"Probably..."

Support conclusions with project documentation or implementation evidence.

---

## Debugging Responses

When debugging:

1. Describe the observed behaviour.
2. Explain the evidence collected.
3. Identify the root cause.
4. Recommend the minimum safe fix.

---

## Code Review Responses

Explain:

- What was reviewed.
- What meets project standards.
- What requires improvement.
- Why the recommendation is made.

Avoid subjective opinions.

---

# 36. AI Output Quality Levels

Every AI response should match the complexity of the request.

---

## Level 1 — Quick Answer

Use for:

- Definitions
- Small questions
- Clarifications

---

## Level 2 — Implementation

Use for:

- Feature implementation
- Bug fixes
- Small enhancements

Provide concise explanations.

---

## Level 3 — Engineering Review

Use for:

- Code review
- Architecture review
- Refactoring recommendations

Include reasoning.

---

## Level 4 — Architecture Analysis

Use for:

- System design
- Major feature planning
- Technology selection

Provide trade-off analysis.

---

## Level 5 — Deep Engineering Consultation

Use for:

- Architecture redesign
- Performance investigation
- Security review
- Long-term planning

Provide comprehensive analysis with documented reasoning.

---

# 37. AI Confidence Assessment

Before implementation, AI should internally assess confidence.

---

## High Confidence

Requirements are clear.

Relevant documentation exists.

Existing implementation found.

Proceed with implementation.

---

## Medium Confidence

Minor uncertainty exists.

Proceed while explicitly documenting assumptions.

---

## Low Confidence

Important information is missing.

Clarification SHOULD be requested before implementation.

---

## Critical Uncertainty

Implementation MUST stop when:

- Authentication is undocumented.
- API behaviour is unknown.
- Security requirements are unclear.
- Architecture conflicts exist.

Request clarification before continuing.

---

# 38. AI Engineering Principles

Every AI assistant should strive to:

- Understand before implementing.
- Read before writing.
- Reuse before creating.
- Preserve before improving.
- Verify before changing.
- Measure before optimizing.
- Explain before recommending.
- Document when behaviour changes.
- Ask when uncertainty exists.

These principles complement the Engineering Rules and should guide every engineering decision.

---

## Cross References

For engineering requirements:

→ Part IV — Engineering Rules

For development processes:

→ Part III — Development Workflows

For quality validation:

→ Part V — Quality Gates

For project governance:

→ Part I — Engineering Foundation

---

End of Part VI — AI Decision Framework

---

# Appendix A — Quick Reference

This appendix provides a quick navigation guide for both engineers and AI assistants.

Use it to identify which project documents should be reviewed before starting a task.

---

## Frontend Development

Engineering Handbook

↓

FRONTEND_GUIDELINES.md

↓

UI_DESIGN_SYSTEM.md

↓

API_CONTRACT.md (if APIs are involved)

↓

Existing Frontend Implementation

---

## Backend Development

Engineering Handbook

↓

BACKEND_GUIDELINES.md

↓

API_CONTRACT.md

↓

Existing Backend Implementation

---

## Full Stack Development

Engineering Handbook

↓

FRONTEND_GUIDELINES.md

↓

BACKEND_GUIDELINES.md

↓

API_CONTRACT.md

↓

UI_DESIGN_SYSTEM.md

↓

Existing Implementation

---

## Debugging

Engineering Handbook

↓

CURRENT_STATUS.md

↓

Relevant Guideline

↓

Existing Implementation

↓

Root Cause Analysis

---

## Code Review

Engineering Handbook

↓

CODING_STANDARDS.md

↓

Relevant Guideline

↓

Engineering Rules

↓

Quality Gates

---

## Documentation Updates

Engineering Handbook

↓

Affected Document

↓

MASTER_CHECKLIST.md

↓

CURRENT_STATUS.md

---

End of Appendix A

---

End of Document

00_AI_ENGINEERING_HANDBOOK.md

Version: 2.0

Status: Active