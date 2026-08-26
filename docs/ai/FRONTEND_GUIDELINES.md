# CrickHero Frontend Guidelines

Version: 1.1

Status: Active

Platform: React Native + Expo

---

# Purpose

This document defines the frontend architecture, development rules,
component standards, navigation conventions, UI principles, and AI
development workflow for the CrickHero mobile application.

Every frontend developer and AI assistant must follow these guidelines.

---
# Document Ownership

This document defines frontend implementation standards only.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- UI_DESIGN_SYSTEM.md (visual design system)
- API_CONTRACT.md (API specification)
- CODING_STANDARDS.md (general coding standards)

Implementation details belong here.

Project governance belongs in the Engineering Handbook.

---

# Scope

This document applies to:

- React Native
- Expo
- Expo Router
- React Native Paper
- Components
- Screens
- Hooks
- Services
- Styling
- Navigation
- State Management

This document does not define:

- Backend implementation
- API specifications
- Authentication architecture
- Engineering governance

---

# Tech Stack

Framework

- React Native

Application Framework

- Expo

Navigation

- Expo Router

Language

- TypeScript

UI Library

- React Native Paper

State

- React Hooks

Backend Communication

- Fetch API

---

# Frontend Philosophy

Build simple.

Build reusable.

Build predictable.

Avoid unnecessary abstraction.

Finish MVP before polishing.

Always preserve existing architecture unless explicitly instructed otherwise.

Prefer minimal, safe, reviewable changes.

---

# Folder Structure

app/

components/

features/

hooks/

services/

theme/

constants/

types/

utils/

assets/

Do NOT place business logic inside app/.

---

# Expo Router Guidelines

Use Expo Router as the official navigation system.

Rules

- Every screen belongs inside app/
- Every route exports one default component.
- Use route groups like (tabs) and (auth).
- Keep _layout.tsx focused on navigation and providers.
- Do not place reusable UI inside app/.

---

# Component Structure

Each component should have one responsibility.

Example

PlayerCard

Responsible only for displaying player information.

NOT

Fetching player data

Navigation

Business calculations

---

# Screen Responsibilities

Screens should:

- Compose UI
- Call hooks
- Trigger services
- Handle navigation

Screens should NOT:

- Contain API logic
- Perform database logic
- Contain reusable business rules

---

# Hooks

Custom hooks belong inside:

hooks/

Examples

useAuth()

useTeams()

useMatch()

useScore()

Rules

Hooks should:

- Encapsulate logic
- Be reusable
- Never render UI

---

# API Layer

Every backend request goes through:

services/

Never call fetch directly from UI components.

Good

Screen

↓

Service

↓

API

Bad

Screen

↓

fetch()

---

# Frontend AI Workflow

Before generating, modifying, reviewing, or refactoring any frontend code,
every AI assistant must follow this workflow.

Requirement

↓

Read

00_AI_ENGINEERING_HANDBOOK.md

↓

Review

FRONTEND_GUIDELINES.md

↓

Review

UI_DESIGN_SYSTEM.md

↓

Review

API_CONTRACT.md
(only if the feature communicates with the backend)

↓

Inspect existing components, hooks and services.

↓

Reuse existing implementation whenever possible.

↓

Generate the minimum safe change.

↓

Preserve existing navigation, architecture and functionality.

↓

Verify against official documentation whenever project documentation
does not explicitly define the behavior.

↓

Perform a self-review before marking the task complete.

AI must NEVER:

- Invent APIs.
- Invent request or response fields.
- Introduce unnecessary dependencies.
- Rewrite unrelated files.
- Replace existing architecture without approval.
- Duplicate existing business logic.

---

# Theme

All colors, typography and design tokens must come from the centralized
theme system.

Follow:

UI_DESIGN_SYSTEM.md

Use centralized tokens from:

theme/

Never hardcode:

- Colors
- Font sizes
- Font weights
- Border radius
- Repeated spacing values
- Elevation values

If a required token does not exist:

1. Reuse an existing semantic token whenever possible.
2. Otherwise recommend adding a new token.
3. Never create duplicate visual values.

---

# Styling

Use

StyleSheet.create()

for component styles.

Prefer shared spacing and typography tokens.

Avoid duplicate styles.

Prefer semantic design tokens over literal values.

Maintain visual consistency with existing screens.

---

# Component Naming

PascalCase

Examples

TeamCard

PlayerTile

MatchHeader

OTPInput

PhoneInput

---

# File Naming

Components

PascalCase.tsx

Hooks

useSomething.ts

Services

authService.ts

teamService.ts

Utilities

camelCase.ts

---

# Props

Always define props using interfaces or types.

Avoid any.

Prefer explicit typing.

---

# State Management

Keep state local whenever possible.

Use custom hooks for shared logic.

Avoid unnecessary global state.

# Forms

Every form should include:

- Validation
- Loading state
- Error state
- Success feedback

Validate input before making API calls.

Follow validation rules defined in:

API_CONTRACT.md

Provide clear and user-friendly validation messages.

---

# Loading States

Never leave users wondering.

Use:

- ActivityIndicator
- Skeleton
- Button loading
- Progress indicator

Every asynchronous operation should provide visual feedback.

---

# Error Handling

Always display user-friendly messages.

Never expose backend exceptions.

Never display stack traces.

Handle:

- Network failures
- API validation errors
- Authentication failures
- Unexpected server errors

Always provide a retry path whenever appropriate.

---

# React Native Paper

Use React Native Paper components whenever suitable.

Examples

Button

TextInput

Card

Dialog

Snackbar

FAB

Maintain a consistent Material Design experience.

Avoid mixing multiple UI libraries unless explicitly approved.

---

# Accessibility

Every interactive component should include:

- Accessibility label (where appropriate)
- Readable text
- Sufficient touch target
- Proper color contrast

Accessibility should never be sacrificed for visual appearance.

---

# Performance

Avoid unnecessary re-renders.

Memoize only when measurable performance benefits exist.

Keep components focused and lightweight.

Avoid unnecessary state updates.

Optimize after measurement, not assumptions.

---

# Navigation

Use:

router.push()

router.replace()

router.back()

Avoid deeply nested navigation logic.

Preserve the existing navigation flow unless explicitly instructed otherwise.

---

# TypeScript

Strict typing required.

Avoid:

any

Prefer:

- interfaces
- type aliases
- readonly where applicable

Prefer compile-time safety over convenience.

---

# Reusable Components

Before creating a new component ask:

Can this be reused?

If yes

Extract it.

Before creating any new reusable component, first inspect the existing
components directory to avoid duplication.

---

# Logging

Temporary console logs only during debugging.

Remove unnecessary logs before merging.

Never log:

- JWT Tokens
- OTP values
- Secrets
- Personal user information

---

# Testing Checklist

Before marking a frontend feature complete:

- UI works
- Validation works
- Loading works
- Error handling works
- Navigation works
- API integration works
- TypeScript passes
- No unused imports
- Theme tokens are used correctly
- Existing functionality remains unchanged

---

# Code Review Checklist

Frontend reviewers verify:

- Follows component structure
- Uses centralized theme tokens
- No duplicated code
- No hardcoded values
- Correct navigation
- Proper TypeScript
- Responsive layout
- API contract followed
- Existing architecture preserved
- Minimal safe implementation

---

# AI Rules

When generating frontend code:

Always:

- Read 00_AI_ENGINEERING_HANDBOOK.md before implementation.
- Follow FRONTEND_GUIDELINES.md.
- Follow UI_DESIGN_SYSTEM.md.
- Follow CODING_STANDARDS.md.
- Follow API_CONTRACT.md.
- Follow DECISIONS.md.
- Use Expo Router conventions.
- Use TypeScript.
- Use React Native Paper where appropriate.
- Reuse existing components whenever possible.
- Preserve existing architecture.
- Make the minimum safe change.

Never:

- Invent APIs.
- Invent request or response fields.
- Introduce a new state-management library without approval.
- Change navigation architecture.
- Hardcode API URLs.
- Hardcode colors, typography or spacing values.
- Duplicate business logic.
- Rewrite unrelated files.
- Refactor large portions of the application unless explicitly requested.

---

# Official Documentation Verification

Whenever generating, reviewing, debugging, refactoring or explaining
frontend code:

If project documentation does not explicitly define a behavior,
verify it against the latest official documentation.

Prefer official documentation for:

- JavaScript
- TypeScript
- React
- React Native
- Expo
- Expo Router
- React Native Paper

Never rely solely on AI memory.

If official documentation differs from this project's documented
standards, follow this project's standards unless an approved
architectural decision updates them.

Never invent:

- APIs
- Component props
- Hooks
- Navigation behavior
- Library features

---

# Future Enhancements

Potential future additions:

- Redux Toolkit
- React Query
- Offline caching
- Dark Theme
- Localization
- Push Notifications
- Accessibility Audit
Before adopting any future enhancement, evaluate it against:

- 00_AI_ENGINEERING_HANDBOOK.md
- Existing project architecture
- MVP priorities

to ensure it aligns with the project's engineering standards and roadmap.
---

# References

Primary project documents:

- 00_AI_ENGINEERING_HANDBOOK.md
- UI_DESIGN_SYSTEM.md
- API_CONTRACT.md
- CODING_STANDARDS.md
- DECISIONS.md
- AI_PROJECT_CONTEXT.md

Official references:

- React
- React Native
- Expo
- Expo Router
- React Native Paper
- TypeScript

When project standards conflict with library examples,
follow this project's documented standards unless an
approved architectural decision updates them.

---

End of Document

Version 1.1