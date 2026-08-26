# CrickHero Coding Standards

**Version:** 1.0

**Status:** Active

**Last Updated:** July 2026

---

# 1. Purpose

This document defines the coding standards for the CrickHero project.

Every contributor (human or AI) must follow these rules.

Objectives:

- Maintain consistency
- Improve readability
- Reduce bugs
- Simplify code reviews
- Enable scalable development

---

# Document Ownership

This document defines coding standards and code quality expectations for the CrickHero project.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- FRONTEND_GUIDELINES.md (frontend implementation)
- BACKEND_GUIDELINES.md (backend implementation)

Implementation-specific rules belong in the implementation guideline documents.

Project governance belongs in the Engineering Handbook.

---
# Scope

This document applies to:

- Naming conventions
- Code formatting
- File organization
- Logging
- Error handling
- TypeScript practices
- React Native coding standards
- Spring Boot coding standards
- Code review expectations

This document does not define:

- Frontend architecture
- Backend architecture
- API specifications
- Engineering governance

---


# 2. Core Principles

## Rule 1

Write code for humans first.

Computers execute code.

Humans maintain it.

---

## Rule 2

Prefer readability over cleverness.

Good

Simple

Readable

Predictable

Bad

Complex

Hidden logic

Nested conditions

Magic values

---

## Rule 3

Small files

Small components

Small methods

---

## Rule 4

One responsibility per class/component.

---

## Rule 5

Never duplicate logic.

Extract reusable functionality.

---
# Coding Workflow

Before writing code:

1. Read 00_AI_ENGINEERING_HANDBOOK.md.
2. Read the relevant implementation guideline.
3. Review existing implementation.
4. Reuse existing code whenever appropriate.
5. Implement the minimum safe change.
6. Self-review against this document before completion.
---

# 3. Naming Conventions

## Variables

Use camelCase.

Good

playerName

matchScore

teamMembers

Bad

PlayerName

player_name

p

---

## Functions

Use verb + noun.

Good

createTeam()

verifyOtp()

calculateStrikeRate()

Bad

team()

otp()

data()

---

## Components

PascalCase

TeamCard

MatchHeader

PlayerList

OTPInput

---

## Hooks

Always start with use.

useAuth()

useMatch()

useTeams()

---

## Interfaces

Prefix with I is NOT required.

Good

Player

Match

AuthResponse

Bad

IPlayer

IMatch

---

## Constants

UPPER_SNAKE_CASE

MAX_OVERS

API_TIMEOUT

DEFAULT_THEME

---

# 4. Folder Structure

Frontend

app/

components/

features/

hooks/

services/

theme/

types/

utils/

assets/

Backend

controller/

service/

repository/

entity/

dto/

config/

security/

exception/

---

# 5. React Native Standards

One component per file.

Prefer functional components.

Use TypeScript everywhere.

Avoid inline styles.

Keep components under ~250 lines when practical.

Extract reusable UI.

Avoid unnecessary re-renders.

Prefer composition over duplication.

---

# 6. React Hooks

Rules

Only call hooks at the top level.

Never call hooks inside loops or conditions.

Keep effects focused.

Avoid unnecessary useEffect.

Use useMemo and useCallback only when they solve a real performance issue.

---

# 7. TypeScript Rules

Never use any unless absolutely necessary.

Prefer explicit interfaces.

Use readonly where appropriate.

Prefer union types over magic strings.

Enable strict mode.

---

# 8. API Standards

Never hardcode URLs.

Always use a central API service.

Every request must:

- Handle loading
- Handle success
- Handle failure

Never ignore errors.

---

# 9. Error Handling

Do not swallow exceptions.

Always log useful information during development.

Display user-friendly messages.

Never expose internal server details.

---

# 10. Logging

Development

Use console.log only for temporary debugging.

Production

Remove unnecessary logs.

Use structured logging on the backend.

---

# 11. Comments

Write comments only when they explain "why".

Do not explain obvious code.

Good

// Required because Expo Router initializes navigation asynchronously.

Bad

// Increment i
i++;

---

# 12. Styling Standards

Use centralized design tokens.

Avoid hardcoded colors.

Avoid duplicate spacing values.

Use shared typography.

Follow the project theme.

---

# 13. State Management

Keep state as local as possible.

Avoid prop drilling when practical.

Separate UI state from business state.

---

# 14. Backend Standards

Controllers

- Validate input
- Delegate to services
- No business logic

Services

- Business rules only

Repositories

- Database access only

DTOs

- Request and response models only

Entities

- Persistence models only

---

# 15. Security Standards

Validate all input.

Never trust client-side validation.

Use JWT after authentication.

Protect sensitive endpoints.

Never log secrets.

---

# 16. Git Standards

Commit messages

feat: Add OTP verification

fix: Resolve login persistence

refactor: Simplify team service

docs: Update API contract

test: Add authentication tests

---

# 17. AI Code Generation Rules

AI-generated code must:

- Compile successfully
- Follow this document
- Match existing architecture
- Avoid unnecessary libraries
- Include error handling
- Preserve project conventions

AI must not redesign architecture without approval.

---

# 18. Code Review Checklist

Before merging, verify:

☐ Compiles successfully

☐ No TypeScript errors

☐ No unused imports

☐ No dead code

☐ Meaningful names

☐ Error handling present

☐ Loading state handled

☐ Validation implemented

☐ Documentation updated (if needed)

☐ Matches API contract

☐ Matches architecture decisions

    ☐ Minimum safe change implemented

---

# 19. Definition of Clean Code

Clean code is:

- Simple
- Readable
- Testable
- Reusable
- Maintainable
- Predictable
- Consistent

---

# 20. Official References

When project-specific guidance is missing, prefer official documentation.

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

Never rely solely on AI memory when official documentation is available.

---

# 21. Document Maintenance

Review this document:

- At the end of each sprint
- Before major refactoring
- When introducing new frameworks
- When adding new AI workflows
- Review this document whenever new coding conventions are formally adopted or approved through DECISIONS.md.

---
# Related Documents

Use this document together with:

- 00_AI_ENGINEERING_HANDBOOK.md
- FRONTEND_GUIDELINES.md
- BACKEND_GUIDELINES.md
- API_CONTRACT.md
- DECISIONS.md

--- 

End of Document

Version 1.0