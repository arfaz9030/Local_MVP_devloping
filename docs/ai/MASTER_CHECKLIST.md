# MatchDay Master Checklist

**Version:** 1.0

**Status:** Active Development

**Purpose:** Daily Execution Dashboard

Last Updated: August 2026

---

# How to Use This File

Read 00_AI_ENGINEERING_HANDBOOK.md first.

Use this document as the daily execution and feature-completion dashboard.

Use it to decide:

- What is complete
- What is currently in progress
- What should be done today
- What is blocked
- What comes next

This file should always reflect the latest project state.
---
# Document Ownership

This document is the daily execution and feature-completion dashboard for the MatchDay project.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- CURRENT_STATUS.md (current implementation status)
- ROADMAP.md (future planning)

This document tracks execution status only.

Engineering standards, API specifications, architecture decisions, and implementation guidance belong in their respective documents.
---
# Scope

This document tracks:

- Feature completion
- Phase progress
- Current sprint tasks
- Daily focus
- Blockers
- Bugs
- Technical debt
- Release readiness
- Documentation completion

This document does not define:

- Engineering standards
- API specifications
- Architecture decisions
- Frontend implementation
- Backend implementation
- Future product strategy

---

# Overall MVP Progress

Project Completion

⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜

Estimated Progress

35%

---

# Phase 1 — Foundation

## Project Setup

- [x] Expo Project Created
- [x] Spring Boot Project Created
- [x] PostgreSQL Connected
- [x] Git Repository
- [x] Initial Folder Structure
- [x] Theme Setup
- [x] Expo Router
- [x] React Native Paper
- [x] Documentation Started

Status

✅ Complete

---

# Phase 2 — Authentication

## UI

- [x] Promo Screen
- [x] Get Started
- [x] Phone Number Screen
- [x] OTP Screen
- [x] Survey Dialog
- [x] Guest Login
- [x] Logout

---

## Backend

- [x] Request OTP API
- [x] Verify OTP API
- [x] Database Integration

---

## Integration

- [x] Frontend → Backend Communication
- [x] Request OTP Working
- [x] Verify OTP Working
- [x] JWT Generation
- [x] JWT Storage
- [x] Auto Login
- [x] Session Restore
- [x] Authentication Guard
- [ ] Refresh Token

Status

✅ Complete (except Refresh Token)

---

# Phase 3 — Teams

## Frontend

- [x] Teams Screen (three-tab layout: Your Teams, Opponents, Add)
- [x] Team List with Search
- [x] TeamCard Component (expandable, avatar initials, player list)
- [x] Empty State (no teams)
- [x] Opponents Tab Placeholder UI
- [x] Create Team Form (name, city, captain name, captain number, checkboxes)
- [x] Create Team API Integration (POST /api/teams)
- [x] Get Teams API Integration (GET /api/teams)
- [x] Team Link / Native Share Sheet (Invite via Share API)
- [x] Add from Contacts (Native contact picker integration via expo-contacts)
- [x] QR Code Flow (TeamQRModal popup, QR share, scanner trigger)
- [ ] Edit Team UI
- [ ] Delete Team UI

## Backend

- [x] POST /api/teams
- [x] GET /api/teams
- [ ] GET /api/teams/{id} (not yet integrated from frontend)
- [ ] PUT /api/teams/{id}
- [ ] DELETE /api/teams/{id}

Status

🟡 Substantially In Progress (Core UI, QR, Contacts, Share Complete)

---

# Phase 4 — Players

## Frontend

- [x] InvitePlayerModal (Add Player form: name, mobile, jersey, role)
- [x] Add Player API Integration (POST /api/teams/{teamId}/players)
- [x] Player list display inside TeamCard
- [x] API failure correctly shows error (no longer fabricates local state)
- [x] Quick actions: Share team link & pick contact from phonebook
- [ ] Edit Player UI
- [ ] Delete / Remove Player UI
- [ ] Player Profile

## Backend

- [x] POST /api/teams/{teamId}/players
- [ ] GET /api/players
- [ ] PUT /api/players/{id}
- [ ] DELETE /api/players/{id}

Status

🟡 Substantially In Progress

---

# Phase 5 — Match Creation

- [x] Create Match Screen UI & Setup Flow (6-stage wizard matching all 18 reference screenshots)
- [x] Select Teams (Team A & Team B selection from existing teams via TeamPickerModal)
- [x] Match Settings (Overs, Ball Type, Pitch Type, Match Type selection chips, Bowler limits)
- [x] Ground / Venue selection (`GroundPickerModal.tsx` with search, popular grounds, and custom entry)
- [x] Match Officials management (`AddOfficialModal.tsx` for Umpires, Scorers with self-assignment, Commentators)
- [x] Playing XI & Squad selection (team tabs, checkboxes, search, counter, quick add player via `AddSquadPlayerModal.tsx`)
- [x] Captain & Wicket Keeper selection (dual `[ C ]` and `[ WK ]` toggle controls)
- [x] Toss (Winner selection, interactive coin flip, elected to bat/bowl)
- [x] Openers selection (Striker, Non-Striker, Opening Bowler)
- [x] AppDrawer opening direction (slides from left to right with translateX translation and right-aligned backdrop)
- [x] Start Match back navigation (exiting setup from TEAM_SELECT returns directly to main Matches tab /(tabs))
- [x] Tab initial route configuration (initialRouteName="index" on Tabs ensures Matches tab is primary default)
- [x] Android hardware Back handling (scoped BackHandler listeners for modal dismissal and step-by-step wizard reversal)
- [ ] Match backend integration (persisted match data in database)

Status

🟡 Frontend Implementation Complete (Full 6-Stage UI Flow matching 18 screenshots; backend integration pending)

---

# Phase 6 — Live Scoring

- [x] Runs (0, 1, 2, 3, 4, 6 and 5, 7 extra runs)
- [x] Wickets (Fall of wicket with dismissal types & incoming batsman via WicketModal)
- [x] Extras (Wide, No-Ball with non-legal ball count, Bye, Leg-Bye)
- [x] Strike Rotation (automatic on odd runs 1, 3, 5, 7 and at end of each over)
- [x] Bowling Figures (O.B-M-R-W calculation and live updates)
- [x] Undo Ball (complete state snapshot restoration via history stack)
- [x] Over Complete (triggered at 6 legal balls with summary cards, ball sequence, Start Next Over & Continue This Over)
- [x] Scoring Shortcuts Bottom Sheet (8-item grid + More shortcuts)
- [x] Match Header (back navigation, team title, native Share.share, settings)
- [x] Background API Sync (calls addScore API asynchronously with floating Synced toast)

Status

✅ Frontend Complete (Backend persistent ball-by-ball events pending)

---

# Phase 7 — Scoreboard

- [x] Live Score (Large hero score digits and overs format matching Screenshot 1 & 4)
- [x] Batting Card (Striker active indicator, runs, balls, 4s, 6s, strike rate, and Replace link)
- [x] Bowling Card (Bowler figures, overs, maidens, runs, wickets, economy)
- [x] Fall Of Wickets (Tracked via dismissal history and full scorecard)
- [x] Full Innings Scorecard Modal (Batting stats, bowling analysis, extras breakdown)
- [ ] Partnerships
- [ ] Match Statistics

Status

🟡 Substantially Complete (Frontend live scorecard modal active)

---

# Phase 8 — Match Summary

- [ ] Result
- [ ] Winner
- [ ] Share Match
- [ ] Scorecard Summary

Status

⬜ Not Started

---

# Phase 9 — Testing

Frontend

- [ ] UI Testing
- [ ] Navigation Testing
- [ ] Component Testing

Backend

- [ ] API Testing
- [ ] Validation Testing
- [ ] Security Testing

Integration

- [ ] End-to-End Testing

---

# Phase 10 — Release

- [ ] Android APK
- [ ] Final Review
- [ ] Documentation Review
- [ ] Version Tag
- [ ] Release Notes

---

# Documentation Checklist

- [x] PROJECT_OVERVIEW.md
- [x] CURRENT_STATUS.md
- [x] DECISIONS.md
- [x] API_CONTRACT.md
- [x] CODING_STANDARDS.md
- [x] ROADMAP.md
- [x] AI_PROJECT_CONTEXT.md
- [x] AI_PROMPTS.md
- [x] FRONTEND_GUIDELINES.md
- [x] BACKEND_GUIDELINES.md

Remaining

- [ ] CHANGELOG.md
---


# Current Sprint

Sprint Goal

Complete Teams + Players Module

Tasks

- [ ] Remove createTeam local-state fallback (API persistence safety fix)
- [ ] Edit Team UI + backend integration
- [ ] Delete Team UI + backend integration
- [ ] Edit Player UI + backend integration
- [ ] Delete Player UI + backend integration
- [x] Team Link / native share sheet
- [ ] Remove debug console.log statements

---

# Today's Focus

Only ONE major task.

Today's Task

Team Link / Native Share Sheet

Status

✅ Completed

---

# Current Blockers

None

---

# Technical Debt

- [ ] Remove createTeam local-state fallback on API failure (High priority — violates API persistence safety)
- [ ] Remove debug console.log statements from production code
- [ ] Centralize design tokens
- [ ] Remove duplicate authentication logic
- [ ] Standardize API responses
- [ ] Improve OTP UI

---

# Bugs

Critical

None

Medium

- [ ] OTP color
- [ ] OTP length consistency
- [ ] createTeam local fallback — API persistence safety violation

Low

- [ ] UI polish

---

# Weekly Review

Every Sunday

- [ ] Update CURRENT_STATUS.md
- [ ] Update ROADMAP.md
- [ ] Update CHANGELOG.md
- [ ] Close completed tasks
- [ ] Add new priorities

---

# Release Checklist

Before MVP Release

- [ ] Authentication Stable
- [ ] Teams Stable
- [ ] Players Stable
- [ ] Match Stable
- [ ] Live Scoring Stable
- [ ] Scoreboard Stable
- [ ] Documentation Updated
- [ ] APK Tested

---

# Notes

Date:

Summary:

Next Action:

---
# Related Documents

Use this document together with:

- 00_AI_ENGINEERING_HANDBOOK.md
- CURRENT_STATUS.md
- ROADMAP.md
- DECISIONS.md
- API_CONTRACT.md
---

End of Document

Version 1.0