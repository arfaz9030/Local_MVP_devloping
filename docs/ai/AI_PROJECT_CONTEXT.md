# AI Project Context
## CrickHero

Version: 1.0

Status: Active

Last Updated: July 2026

---

# Purpose

This document is the master context for every AI assistant working on the CrickHero project.

Every AI (ChatGPT, Google AI Studio, Perplexity, or future AI tools) should read and follow this document before generating code, making architectural decisions, reviewing code, or suggesting changes.

This document is the project's "single source of truth" for AI context.

---

# Document Ownership

This document provides the permanent project context for AI assistants working on the CrickHero project.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- CURRENT_STATUS.md (current implementation progress)
- DECISIONS.md (approved architectural decisions)

This document contains long-term project context.

Implementation standards belong in the dedicated engineering guideline documents.

---
# Scope

This document applies to:

- Long-term project context
- Project vision
- Technology stack
- Development philosophy
- AI responsibilities
- AI behaviour
- Long-term engineering goals

This document does not define:

- Frontend implementation
- Backend implementation
- API specifications
- Sprint progress
- Engineering governance

---

# Project Summary

Project Name

CrickHero

Project Type

Mobile Cricket Scoring Application

Current Stage

MVP Development

Primary Goal

Deliver a production-ready Android MVP within two weeks.

---

# Project Vision

Create a fast, reliable and user-friendly cricket scoring platform that enables users to:

- Login
- Create teams
- Add players
- Create matches
- Score live matches
- View scorecards
- Share match results

The MVP should prioritize usability and reliability over feature completeness.

---

# Technology Stack

Frontend

- React Native
- Expo
- Expo Router
- TypeScript
- React Native Paper

Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA

Database

- PostgreSQL

Version Control

- Git
- GitHub

Development Tools

- VS Code

AI Tools

- ChatGPT
- Google AI Studio
- Perplexity

---

# Current Project Status

Authentication is nearly complete.

Current priority:

Complete login persistence.

After authentication:

1. Teams
2. Players
3. Match Creation
4. Live Scoring
5. Scoreboard
6. Match Summary

Always verify CURRENT_STATUS.md before making recommendations.

---

# AI Responsibilities

AI should:

- Explain decisions.
- Prefer simple solutions.
- Recommend scalable architecture.
- Follow official documentation.
- Produce maintainable code.
- Preserve existing architecture.
- Keep responses focused.

AI should NOT:

- Rewrite unrelated files.
- Change architecture without approval.
- Introduce unnecessary dependencies.
- Guess APIs or library behavior.
- Break existing features.

---

# Development Philosophy

Build small.

Test often.

Review frequently.

Refactor only when necessary.

Deliver working software before polishing.

Avoid overengineering.

---

# Project Principles

MVP First

Working software is more valuable than perfect software.

Keep It Simple

Choose the simplest solution that meets requirements.

Separation of Concerns

Presentation

↓

Business Logic

↓

Data

↓

Database

Reusable Components

Build once.

Reuse everywhere.

---

# Official Documentation Policy

When uncertainty exists, prefer official documentation over AI memory.

Frontend

- JavaScript
- TypeScript
- React
- React Native
- Expo
- React Native Paper

Backend

- Java
- Spring Boot
- Spring Security
- Jakarta Validation
- PostgreSQL

Never invent APIs.

---

# AI Workflow

Requirement

↓

Engineering Handbook

↓

Relevant Project Documents

↓

Existing Implementation

↓

Implementation Plan

↓

Minimum Safe Change

↓

Self Review

↓

Testing

↓

Documentation Update

↓

Ready for Review
---

# AI Chat Responsibilities

Tech Lead

Makes decisions.

Frontend

Implements React Native.

Backend

Implements Spring Boot.

Debugging

Finds root causes.

Architecture

Designs scalable systems.

Learning

Explains concepts.

Reviewer

Reviews code before merge.

No chat should perform another chat's primary responsibility.

---

# Coding Expectations

Follow:

- CODING_STANDARDS.md
- API_CONTRACT.md
- DECISIONS.md

Never violate those documents.

---
# Documentation Hierarchy

When project documents appear to conflict, follow the priority defined in:

00_AI_ENGINEERING_HANDBOOK.md

The Engineering Handbook is the authoritative source for project governance and document precedence.

Refer to the Engineering Handbook for the complete document priority order.

---

# Security Rules

Never expose secrets.

Never hardcode credentials.

Validate server-side.

Use JWT after authentication.

Follow secure coding practices.

---

# Quality Rules

Every feature must include:

- Validation
- Loading state
- Error handling
- User feedback
- Logging (development)
- Documentation updates

---

# AI Output Rules

Before writing code:

- Understand the requirement.
- Review relevant project documents.
- Check dependencies.
- Explain the approach.
- Generate only the required changes.

Avoid large rewrites.

Prefer minimal, safe, reviewable changes.

---

# Long-Term Goal

The project should remain understandable by a new developer after six months without requiring explanations from the original author.

Documentation should be sufficient for onboarding.
The Engineering Handbook remains the governing document for all engineering activities throughout the project's lifecycle.
---

# Success Criteria

The project is successful when:

✓ A complete cricket match can be managed digitally.

✓ Authentication is reliable.

✓ Live scoring is stable.

✓ Code is maintainable.

✓ Documentation stays synchronized with implementation.

✓ AI-generated code follows project standards.

---
# Related Documents

Use this document together with:

- 00_AI_ENGINEERING_HANDBOOK.md
- CURRENT_STATUS.md
- DECISIONS.md
- PROJECT_OVERVIEW.md
- API_CONTRACT.md

---

End of Document

Version 1.0