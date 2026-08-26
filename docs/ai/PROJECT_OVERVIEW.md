# CrickHero Project Overview
**Version:** 1.0  
**Status:** Active Development (MVP)  
**Owner:** Mohammad Arfaz Shaik  
**Last Updated:** July 2026

---

# 1. Project Vision

CrickHero is a modern mobile application built to simplify cricket scoring, team management, player statistics, and match organization.

The objective is to provide a fast, intuitive, and reliable experience for players, organizers, scorers, and cricket enthusiasts.

The MVP focuses on delivering the minimum feature set required to conduct a complete cricket match digitally.

---

# 2. Mission

Build a production-ready Cricket Scoring application within two weeks while maintaining clean architecture, scalable code, and high development speed.

The project prioritizes:

- Simplicity
- Maintainability
- Scalability
- Learning
- Production readiness

---

# 3. MVP Scope

## Authentication

- OTP Login
- Guest Login
- JWT Authentication
- Auto Login
- Logout

---

## Teams

- Create Team
- Update Team
- Delete Team
- Team Listing

---

## Players

- Add Player
- Edit Player
- Remove Player

---

## Matches

- Create Match
- Select Teams
- Toss
- Playing XI
- Match Settings

---

## Live Scoring

- Runs
- Wickets
- Extras
- Strike Rotation
- Bowling Figures
- Overs

---

## Scoreboard

- Live Score
- Batting Card
- Bowling Card
- Partnership
- Fall of Wickets

---

## Match Summary

- Result
- Winner
- Scorecard
- Statistics

---

# 4. Target Users

Primary Users

- Local Cricket Players
- Tournament Organizers
- Cricket Academies
- Umpires
- Scorers

Secondary Users

- Coaches
- Spectators
- Team Managers

---

# 5. Technology Stack

## Frontend

- React Native
- Expo
- Expo Router
- TypeScript
- React Native Paper

---

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- REST API

---

## Database

- PostgreSQL

---

## Development Tools

- VS Code
- Git
- GitHub

---

## AI Tools

- ChatGPT
- Google AI Studio
- Perplexity

---

# 6. Architecture Philosophy

The project follows:

Presentation Layer

↓

Business Logic Layer

↓

Data Layer

↓

Database

Each layer should have a single responsibility.

---

# 7. Project Structure

Frontend

app/

components/

src/

hooks/

services/

theme/

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

# 8. Core Development Principles

1. MVP First

Complete working features before adding polish.

---

2. Keep It Simple

Avoid unnecessary abstractions.

---

3. Reusable Components

Build once.

Reuse everywhere.

---

4. Separation of Concerns

UI should never contain business logic.

Business logic should never contain database logic.

---

5. Official Documentation First

Whenever there is uncertainty:

- JavaScript Official Documentation
- React Official Documentation
- React Native Official Documentation
- Expo Documentation
- React Native Paper Documentation
- Spring Boot Documentation
- Spring Security Documentation

Never rely solely on AI assumptions.

---

# 9. Engineering Standards

Project implementation must follow:

- CODING_STANDARDS.md
- FRONTEND_GUIDELINES.md
- BACKEND_GUIDELINES.md
- API_CONTRACT.md
- DECISIONS.md

---

# 10. AI Collaboration

AI-assisted development follows the Engineering Handbook and the reusable role definitions in:

AI_PROMPTS.md

AI assistants must use the appropriate project documents for the task being performed.
---

# 11. Engineering Workflow

Engineering work follows the workflow defined in:

00_AI_ENGINEERING_HANDBOOK.md

This document provides project context and direction only.
Implementation workflows are defined by the Engineering Handbook and relevant engineering guidelines.
---

# 12. Development Rules

Always prefer:

Small commits

↓

Small features

↓

Frequent testing

↓

Frequent reviews

Avoid:

Large rewrites

Premature optimization

Unnecessary libraries

Duplicate code

---
# 13. Security Direction

Security is a project-wide requirement.

Authentication, authorization, validation, secure data handling, and endpoint protection must follow:

- API_CONTRACT.md
- BACKEND_GUIDELINES.md
- CODING_STANDARDS.md
- DECISIONS.md

---

# 14. Performance Direction

The MVP should provide:

- Responsive user interactions
- Efficient API communication
- Reasonable application startup performance
- Maintainable and efficient components

Performance optimization should be introduced when justified by actual requirements or measured bottlenecks.

---

# 15. Documentation

Project documentation is maintained according to the Engineering Handbook.

Each document has a defined responsibility and should remain synchronized with the implementation.

Feature-specific documentation should be maintained in the appropriate project document.

---

# 16. Current MVP Priority

Priority 1

Authentication

Priority 2

Teams

Priority 3

Players

Priority 4

Match Creation

Priority 5

Live Scoring

Priority 6

Scoreboard

Priority 7

Match Summary

---

# 17. Definition of Done

A feature is considered complete only when:

✓ UI Completed

✓ Backend Completed

✓ API Connected

✓ Error Handling Added

✓ Loading State Added

✓ Validation Added

✓ Code Reviewed

✓ Tested

✓ Documentation Updated

---

# 18. Long-Term Vision

After MVP:

- Tournament Management
- Live Streaming Integration
- Push Notifications
- Player Analytics
- AI Match Insights
- Offline Match Scoring
- Multi-language Support
- Admin Dashboard
- Premium Features

---

# 19. Project Success Criteria

The project is successful when:

- Users can complete an entire cricket match digitally.
- Authentication is reliable.
- Live scoring is stable.
- The application is maintainable.
- The architecture supports future growth.
- New developers can understand the project quickly using the documentation.

---

End of Document
Version 1.0