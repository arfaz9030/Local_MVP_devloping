# CrickHero Architecture Decision Log (ADR)

**Version:** 1.0
**Status:** Active
**Created:** July 2026

---

# Purpose

This document records all important technical and architectural decisions made during the CrickHero project.

Every significant decision should answer:

- What was decided?
- Why was it decided?
- What alternatives were considered?
- What are the consequences?
- Can this decision change later?

This document is the single source of truth for architectural decisions.

---
# Document Ownership

This document records architectural and engineering decisions for the CrickHero project.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- AI_PROJECT_CONTEXT.md (long-term project context)
- CURRENT_STATUS.md (implementation progress)

This document records approved engineering decisions.

Implementation details belong in the implementation guideline documents.

---
# Scope

This document applies to:

- Architecture decisions
- Technology selection
- Framework selection
- Design patterns
- Engineering principles
- Project-wide technical decisions

This document does not define:

- Frontend implementation
- Backend implementation
- API specifications
- Sprint planning
- Current project status

---

# Decision Status

Use one of the following statuses:

- Proposed
- Accepted
- Superseded
- Rejected
- Deprecated

---
# ADR Workflow

Whenever a significant engineering decision is made:

1. Review 00_AI_ENGINEERING_HANDBOOK.md.
2. Evaluate alternatives.
3. Document the selected decision.
4. Record the reason and consequences.
5. Update related project documents if required.
6. Mark the ADR status appropriately.

---

# ADR-001

## Title

Use React Native for Mobile Development

### Status

Accepted

### Date

July 2026

### Context

The application is mobile-first and should support Android initially with future iOS support.

### Alternatives

- Flutter
- Native Android
- Kotlin Multiplatform

### Decision

Use React Native.

### Reason

- JavaScript ecosystem
- Large community
- Fast development
- Excellent Expo support
- Easier hiring

### Consequences

Pros

- Faster development
- Shared codebase

Cons

- Native modules occasionally required

---

# ADR-002

## Title

Use Expo Framework

### Status

Accepted

### Context

Need rapid MVP development.

### Alternatives

- React Native CLI

### Decision

Use Expo.

### Reason

- OTA Updates
- Faster setup
- Easier development
- Better developer experience

### Consequences

Pros

- Faster MVP

Cons

- Some native limitations

---

# ADR-003

## Title

Use Expo Router

### Status

Accepted

### Alternatives

- React Navigation

### Decision

Use Expo Router.

### Reason

- Official Expo recommendation
- File-based routing
- Cleaner project organization

### Consequences

Pros

- Less navigation boilerplate
- Easier maintenance

Cons

- Learning curve

---

# ADR-004

## Title

Use React Native Paper

### Status

Accepted

### Alternatives

- NativeBase
- UI Kitten
- React Native Elements

### Decision

React Native Paper

### Reason

- Material Design
- Good documentation
- Strong component library

### Consequences

Pros

- Consistent UI
- Accessible components

Cons

- Material Design look and feel

---

# ADR-005

## Title

Use Spring Boot Backend

### Status

Accepted

### Alternatives

- Node.js
- Django
- Laravel

### Decision

Spring Boot

### Reason

- Existing Java experience
- Mature ecosystem
- Excellent security
- Enterprise-grade

### Consequences

Pros

- Scalable
- Reliable

Cons

- More boilerplate than some alternatives

---

# ADR-006

## Title

Use PostgreSQL

### Status

Accepted

### Alternatives

- MySQL
- MongoDB

### Decision

PostgreSQL

### Reason

- Strong relational support
- ACID compliance
- Excellent indexing
- Mature ecosystem

### Consequences

Pros

- Reliable
- Scalable

Cons

- Slightly steeper learning curve

---

# ADR-007

## Title

OTP Authentication

### Status

Accepted

### Decision

Authenticate users with mobile OTP.

### Reason

- No password management
- Better user experience
- Faster onboarding

Future

JWT authentication after OTP verification.

---

# ADR-008

## Title

Guest Login

### Status

Accepted

### Decision

Allow guest access.

### Reason

Reduce friction.

Allow users to explore before registration.

---

# ADR-009

## Title

Frontend Architecture

### Status

Accepted

### Decision

Feature-first architecture.

Example

app/

components/

services/

hooks/

theme/

assets/

Reason

Simple

Scalable

Easy onboarding

---

# ADR-010

## Title

Backend Architecture

### Status

Accepted

### Decision

Layered Architecture

Controller

↓

Service

↓

Repository

↓

Database

Reason

Separation of concerns.

---

# ADR-011

## Title

Project Documentation

### Status

Accepted

### Decision

Store documentation inside

docs/ai/

Reason

Version controlled.

Lives with code.

Easy onboarding.

---

# ADR-012

## Title

AI Development Strategy

### Status

Accepted

### Decision

Separate AI chats by responsibility.

Tech Lead

Frontend

Backend

Debugging

Architecture

Learning

Reviewer

Reason

Reduce context switching.

Improve AI consistency.

---

# ADR-013

## Title

MVP First

### Status

Accepted

### Decision

Always complete a working feature before polishing UI.

Reason

Shipping is more important than perfection.

---

# ADR-014

## Title

Official Documentation First

### Status

Accepted

### Decision

Whenever uncertainty exists:

- JavaScript documentation
- React documentation
- React Native documentation
- Expo documentation
- React Native Paper documentation
- Spring Boot documentation

Reason

Reduce AI hallucinations.

Increase correctness.

---

# ADR-015

## Title

Code Generation Strategy

### Status

Accepted

### Decision

Use multiple AI tools.

ChatGPT

Architecture

Planning

Reviews

Google AI Studio

Frontend implementation

Teaching

Perplexity

Large code generation

Reason

Use the strengths of each tool.

---
# ADR-016

## Title

Modular Monolith Architecture

### Status

Accepted

### Date

August 2026

### Context

The MVP requires rapid delivery with limited development time while remaining scalable for future growth.

### Alternatives

- Microservices
- Modular Monolith

### Decision

Use a Modular Monolith architecture for the MVP.

### Reason

- Faster development
- Simpler deployment
- Easier debugging
- Lower operational complexity
- Clear module boundaries
- Future migration to microservices remains possible

### Consequences

Pros

- Faster MVP delivery
- Simpler architecture
- Easier testing
- Lower maintenance overhead

Cons

- Future service extraction may require additional refactoring if the application grows significantly.

### Future Considerations

If the project scales substantially, modules such as Authentication, Teams, Matches, Live Scoring, and Notifications can be extracted into independent microservices.

---

### Implementation

The implementation of this decision shall follow the standards defined in:

- API_CONTRACT.md
- BACKEND_GUIDELINES.md
- CODING_STANDARDS.md

---

# Future Decisions

The following ADRs will be added later.

- Offline Scoring
- Push Notifications
- Live Streaming
- Match Sync
- Tournament Module
- Admin Dashboard
- Premium Subscription
- Analytics
- Crash Reporting
- CI/CD Pipeline

---

# ADR Template

## ADR-XXX

Title

Status

Date

Context

Alternatives

Decision

Reason

Consequences

Future Considerations

---
# Related Documents

Use this document together with:

- 00_AI_ENGINEERING_HANDBOOK.md
- AI_PROJECT_CONTEXT.md
- CURRENT_STATUS.md
- API_CONTRACT.md
- BACKEND_GUIDELINES.md
- FRONTEND_GUIDELINES.md

---

End of Document

Version 1.0