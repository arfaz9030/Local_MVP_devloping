# CrickHero Development Roadmap

**Version:** 1.0

**Status:** Active Development

**Project Type:** Mobile MVP

**Target Platform:** Android (Phase 1)

**Estimated MVP Duration:** 2 Weeks

---

# Purpose

This roadmap defines the execution plan for CrickHero.

It describes:

- Development phases
- Milestones
- Dependencies
- Deliverables
- Success criteria
- Risks

This document is updated whenever project priorities, milestones, dependencies, or delivery plans change.

Changes should remain consistent with:

- 00_AI_ENGINEERING_HANDBOOK.md
- DECISIONS.md
- CURRENT_STATUS.md
- MASTER_CHECKLIST.md

---
# Document Ownership

This document defines the development roadmap for the CrickHero project.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- MASTER_CHECKLIST.md (feature completion)
- CURRENT_STATUS.md (current implementation status)
- DECISIONS.md (architectural decisions)

This document defines development direction, milestones, dependencies, and priorities.

Detailed implementation standards belong in the relevant engineering guideline documents.

---


# Project Vision

Deliver a production-ready MVP that allows users to:

- Login
- Create Teams
- Create Matches
- Score Live Matches
- View Scorecards
- Share Results

---

# Development Philosophy

Development follows the engineering workflow defined in:

00_AI_ENGINEERING_HANDBOOK.md

For roadmap planning, each phase should:

- Build the required MVP capability.
- Validate the implementation.
- Review the result.
- Address necessary issues.
- Move to the next milestone.

Avoid postponing all testing and review until the end of development.

---

# MVP Timeline

Week 1

Project Foundation

↓

Authentication

↓

Teams

↓

Players

↓

Match Creation

Week 2

Live Scoring

↓

Scoreboard

↓

Summary

↓

Testing

↓

Bug Fixing

↓

APK Release

---

# Phase 1 — Foundation

Status

🟢 Nearly Complete

Deliverables

- Expo Router
- Theme
- Navigation
- Spring Boot
- PostgreSQL
- Project Structure
- Documentation
- API Contract

Success Criteria

- Frontend and backend communicate successfully.
- Project structure is stable.

---

# Phase 2 — Authentication

Status

✅ Completed

Deliverables

- OTP Request
- OTP Verification
- JWT Authentication
- Login Persistence
- Guest Login
- Logout
- Session Restore

Dependencies

Phase 1

Success Criteria

User remains logged in after restarting the app.

---

# Phase 3 — Teams

Status

🟡 In Progress

Deliverables

- Create Team ✅
- Team List ✅
- Edit Team ⬜ Pending
- Delete Team ⬜ Pending
- Team Link / Share Sheet ⬜ Pending
- QR Code / Contacts Invite ⬜ Pending

Dependencies

Authentication

Success Criteria

User can manage teams.

---

# Phase 4 — Players

Status

🟡 In Progress

Deliverables

- Add Player ✅
- Edit Player ⬜ Pending
- Delete Player ⬜ Pending
- Player List (inside TeamCard) ✅

Dependencies

Teams

Success Criteria

Every team contains players.

---

# Phase 5 — Match Creation

Status

⚪ Planned

Deliverables

- Create Match
- Select Teams
- Toss
- Playing XI
- Match Settings

Dependencies

Teams

Players

Success Criteria

Ready to start a match.

---

# Phase 6 — Live Scoring

Status

⚪ Planned

Deliverables

- Runs
- Wickets
- Extras
- Overs
- Strike Rotation
- Bowling Figures
- Undo Ball

Dependencies

Match Creation

Success Criteria

Entire innings can be scored digitally.

---

# Phase 7 — Scoreboard

Status

⚪ Planned

Deliverables

- Live Score
- Batting Card
- Bowling Card
- Partnership
- Fall of Wickets

Dependencies

Live Scoring

Success Criteria

Complete scorecard displayed correctly.

---

# Phase 8 — Match Summary

Status

⚪ Planned

Deliverables

- Result
- Winner
- Statistics
- Share Scorecard

Dependencies

Scoreboard

Success Criteria

Match officially completed.

---

# Phase 9 — Quality Assurance

Status

⚪ Planned

Deliverables

- Manual Testing
- API Testing
- UI Testing
- Performance Testing
- Bug Fixes

Dependencies

All Features

Success Criteria

No critical bugs remain.

---

# Phase 10 — MVP Release

Status

⚪ Planned

Deliverables

- Android APK
- Documentation Review
- Version Tag
- Backup

Success Criteria

Users can install and complete an entire cricket match.

---

# Milestones

| Milestone | Target |
|-----------|--------|
| M1 | Foundation Complete |
| M2 | Authentication Complete |
| M3 | Teams Complete |
| M4 | Players Complete |
| M5 | Match Creation Complete |
| M6 | Live Scoring Complete |
| M7 | Scoreboard Complete |
| M8 | MVP Release |

---

# Critical Path

Foundation

↓

Authentication

↓

Teams

↓

Players

↓

Match Creation

↓

Live Scoring

↓

Scoreboard

↓

Summary

↓

Testing

↓

Release

---

# Risks

High

- Live scoring complexity

Medium

- Authentication edge cases

Low

- UI polish

---

# Non-Goals (MVP)

These are intentionally postponed:

- Tournament Management
- Push Notifications
- Live Streaming
- AI Analytics
- Offline Sync
- Admin Dashboard
- Premium Features

---

# Definition of Success

The MVP is successful when a user can:

✓ Login

✓ Create Team

✓ Add Players

✓ Create Match

✓ Toss

✓ Score Every Ball

✓ Finish Match

✓ View Scorecard

✓ Share Result

---

# Weekly Review Checklist

Every Sunday review:

☐ Completed milestones

☐ Blockers

☐ Technical debt

☐ Documentation updates

☐ Priority changes

☐ Risks

---

# Release Strategy

Version 0.1.0

Authentication

Version 0.2.0

Teams & Players

Version 0.3.0

Matches

Version 0.4.0

Live Scoring

Version 0.5.0

Scoreboard

Version 1.0.0

Production MVP

---
# Related Documents

Use this document together with:

- 00_AI_ENGINEERING_HANDBOOK.md
- MASTER_CHECKLIST.md
- CURRENT_STATUS.md
- DECISIONS.md
- PROJECT_OVERVIEW.md

---

End of Document

Version 1.0