# CrickHero API Contract

**Version:** 1.1

**Status:** Active (Synchronized)

**API Version:** v1

**Base URL (Development):**

http://localhost:2020 (or network host e.g. http://192.168.29.120:2020)

---

# Purpose

This document defines the API contract between the React Native Frontend and the Spring Boot Backend.

It is the single source of truth for:

- Endpoints
- Request payloads
- Response payloads
- Validation rules
- Authentication
- HTTP Status Codes
- Error responses
- Naming conventions

No endpoint should be implemented or modified without updating this document first.

---

# Document Ownership

This document defines the API contract between the frontend and backend.

It is the authoritative source for:

- API endpoints
- Request payloads
- Response payloads
- Validation rules
- Authentication requirements
- HTTP status codes
- Error response formats

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- BACKEND_GUIDELINES.md (backend implementation)
- FRONTEND_GUIDELINES.md (frontend integration)

Implementation details belong in the implementation guidelines.

Project governance belongs in the Engineering Handbook.

---
# Scope

This document applies to:

- REST API endpoints
- Request payloads
- Response payloads
- HTTP methods
- Validation rules
- Authentication requirements
- Error response formats
- API versioning

This document does not define:

- Backend implementation
- Frontend implementation
- Business logic
- UI behaviour
- Engineering governance

---

# General Standards

## Base URL

Development

http://localhost:2020

Production

(To be decided)

---

## API Prefix

/api

Example

/api/auth/request-otp

---

## Content Type

All requests

Content-Type:

application/json

---

## Response Format

Successful responses should return JSON.

Example

{
  "message": "...",
  "data": {}
}

Error responses should also return JSON.

---

# Authentication

## Authentication Scheme

JWT Bearer Token (following OTP verification).

Users authenticate via mobile number and one-time password (OTP). Upon successful verification via `/api/auth/verify-otp`, the backend issues a signed JWT Bearer token. All secured endpoints require this token passed in the `Authorization` request header.

## Implementation Status

Partially Active / Core Flow Verified:
- OTP Generation (`POST /api/auth/request-otp`): Implemented / Verified.
- OTP Verification & Initial JWT Issue (`POST /api/auth/verify-otp`): Implemented / Verified.
- JWT Bearer Header on secured endpoints: Implemented / Verified.
- Refresh Token Handling & Token Rotation Endpoint: PENDING / REQUIRES CLARIFICATION (not implemented in backend or integrated in frontend; `refreshToken` returns null).

## Authorization Header

Authorization: Bearer <JWT_TOKEN>

---
# API AI Workflow

Before generating or modifying APIs:

1. Read 00_AI_ENGINEERING_HANDBOOK.md.
2. Read API_CONTRACT.md.
3. Review the existing backend implementation.
4. Review the existing frontend integration (if applicable).
5. Do not invent endpoints, request fields, response fields, or validation rules.
6. Generate the minimum safe change.
7. Perform a self-review before completion.

---

# Naming Convention

Use camelCase.

Correct

mobileNumber

teamName

playerId

Incorrect

mobile_number

Team_Name

PlayerID

---

# HTTP Status Codes

200 OK

Request successful.

201 Created

Resource created.

400 Bad Request

Validation failed.

401 Unauthorized

Authentication required.

403 Forbidden

Access denied.

404 Not Found

Resource not found.

409 Conflict

Duplicate resource.

500 Internal Server Error

Unexpected server error.

---

# API Modules

Authentication

Teams

Players

Matches

Scoring

Profile

Statistics

---

# AUTH MODULE

## Module Status

Partially Active (Core OTP generation, verification, and JWT issuance are Implemented / Verified; Refresh Token handling is PENDING / REQUIRES CLARIFICATION)

---

## Request OTP

POST

/api/auth/request-otp

Status

Implemented / Verified

Purpose

Generate OTP for mobile verification.

Request

{
    "mobileNumber":"9876543210"
}

Validation

Required

10 digits

Numeric only

Success Response

HTTP 200

{
    "userId":1,
    "message":"OTP generated successfully",
    "mobileNumber":"9876543210",
    "verified":false,
    "expiresAt":"2026-07-22T07:23:08",
    "otp":"57676"
}

Possible Errors

400

Invalid mobile number

500

Server error

---

## Verify OTP

POST

/api/auth/verify-otp

Status

Implemented / Verified

Purpose

Verify OTP and authenticate user, returning JWT Bearer token.

Request

{
    "mobileNumber":"9876543210",
    "otp":"57676"
}

Validation

- mobileNumber: Required, 10 digits, numeric
- otp: Required, 5 digits, numeric

Success Response

HTTP 200 OK

{
    "message":"Login Successful",
    "mobileNumber":"9876543210",
    "token":"JWT_TOKEN",
    "userId":1,
    "refreshToken":null
}

Notes

- token: Required string containing signed JWT Bearer token.
- refreshToken: Currently returns null in the verified response. Refresh token issuance, lifecycle, and rotation are PENDING / REQUIRES CLARIFICATION.

Errors

400

Invalid OTP or validation failure

401

OTP expired or invalid

500

Server error

---

## Refresh Token Handling / Rotation

Status

PENDING / REQUIRES CLARIFICATION

Purpose

Token refresh and rotation lifecycle.

Notice

Refresh token issuance, validation, and rotation are not implemented or integrated (as noted in CURRENT_STATUS.md and MASTER_CHECKLIST.md). The `/api/auth/verify-otp` response returns `refreshToken: null`. No dedicated refresh endpoint is verified or active in the current system.

---

# TEAM MODULE

## Module Status

Active Development (Core endpoints implemented and verified)

---

## Create Team

POST

/api/teams

Status

Implemented / Verified

Purpose

Create a new cricket team for the authenticated user.

Authentication

Required

Authorization: Bearer <JWT_TOKEN>

Request Headers

Content-Type: application/json

Request

{
    "name":"Hyderabad Nizampet Boys",
    "captainName":"MohammadArfaz Shaik"
}

Validation

- name: Required, String (1-100 characters, non-blank)
- captainName: Required, String (1-100 characters, non-blank)

Success Response

HTTP 201 Created / HTTP 200 OK

{
    "id":1,
    "name":"Hyderabad Nizampet Boys",
    "captainName":"MohammadArfaz Shaik",
    "logoUrl":null,
    "players":[]
}

Errors

400

Validation failed (missing or invalid fields)

401

Unauthorized (missing or invalid/expired token)

409

Conflict (team with same name already exists)

500

Server error

Note on Extended UI Fields

The frontend UI collects city, captainNumber, allowCaptainAddPlayers, and addSelf. The verified backend contract currently persists { name, captainName }. Persisting additional fields on the backend is marked: REQUIRES CLARIFICATION.

---

## Get Teams

GET

/api/teams

Status

Implemented / Verified

Purpose

Retrieve all teams associated with the authenticated user, including their player rosters.

Authentication

Required

Authorization: Bearer <JWT_TOKEN>

Request

None

Success Response

HTTP 200 OK

[
    {
        "id":1,
        "name":"Hyderabad Nizampet Boys",
        "captainName":"MohammadArfaz Shaik",
        "logoUrl":null,
        "players":[
            {
                "id":101,
                "name":"MohammadArfaz Shaik",
                "jerseyNumber":7,
                "role":"All-Rounder",
                "battingStyle":"Right-hand bat",
                "bowlingStyle":"Right-arm medium"
            }
        ]
    }
]

Errors

401

Unauthorized (missing or invalid/expired token)

500

Server error

---

## Pending Team Endpoints

- GET /api/teams/{id} — Defined but not yet integrated (Planned - Retrieve team details by ID)
- PUT /api/teams/{id} — Planned (Edit Team)
- DELETE /api/teams/{id} — Planned (Delete Team)

---

# PLAYER MODULE

## Module Status

Active Development (Team-scoped player creation implemented and verified)

---

## Add Player to Team

POST

/api/teams/{teamId}/players

Status

Implemented / Verified

Purpose

Add a player to a specific team's roster.

Authentication

Required

Authorization: Bearer <JWT_TOKEN>

Path Parameter

- teamId: Long / Integer (Required, ID of the target team)

Request Headers

Content-Type: application/json

Request

{
    "name":"Virat Kohli",
    "teamId":1,
    "mobileNumber":"9876543210",
    "jerseyNumber":18,
    "role":"Batsman",
    "battingStyle":"Right-hand bat",
    "bowlingStyle":"Right-arm medium"
}

Validation

- name: Required, String (1-100 characters, non-blank)
- teamId: Required, Long / Integer (must match path parameter)
- mobileNumber: Optional, String (10 digits numeric)
- jerseyNumber: Optional, Integer (1-999)
- role: Optional, String (Batsman, Bowler, All-Rounder, Wicketkeeper)
- battingStyle: Optional, String
- bowlingStyle: Optional, String

Success Response

HTTP 201 Created / HTTP 200 OK

{
    "id":102,
    "name":"Virat Kohli",
    "jerseyNumber":18,
    "role":"Batsman",
    "battingStyle":"Right-hand bat",
    "bowlingStyle":"Right-arm medium"
}

Errors

400

Validation failed (missing player name)

401

Unauthorized (missing or invalid/expired token)

404

Team not found

500

Server error

---

## Pending Player Endpoints

- GET /api/players — Planned (Global player search; currently players are retrieved nested via GET /api/teams) — REQUIRES CLARIFICATION
- PUT /api/players/{id} — Planned (Edit Player)
- DELETE /api/players/{id} — Planned (Delete / Remove Player from team)

---

# MATCH MODULE

## Module Status

Frontend Demo Only (Backend Integration Pending)

Notice: The match endpoints below are defined in the frontend client (matchApi.tsx) for demo and mock flows, but backend implementation and integration remain pending. Do NOT treat these as verified backend endpoints.

---

## Create Match

POST

/api/matches

Status

Defined but not yet integrated (Frontend Demo Only)

Purpose

Initialize a new match between two teams.

Authentication

Required

Authorization: Bearer <JWT_TOKEN>

Request Headers

Content-Type: application/json

Request

{
    "team1Name":"Hyderabad Nizampet Boys",
    "team2Name":"Hyderabad Tolichowki Boys"
}

Validation (Client level)

- team1Name: Required, String
- team2Name: Required, String (must differ from team1Name)

Expected Response

HTTP 201 Created / HTTP 200 OK

{
    "matchId":"m_101",
    "team1Name":"Hyderabad Nizampet Boys",
    "team2Name":"Hyderabad Tolichowki Boys",
    "runs":0,
    "wickets":0,
    "overs":0,
    "status":"NOT STARTED"
}

Errors

400

Validation error

401

Unauthorized

Note on Match Settings

The Create Match UI collects overs (5, 8, 10, 12, 15, 20), ballType ('Tennis', 'Leather', 'Rubber'), matchType ('Limited Overs', 'Box Cricket', 'Test Match'), and team1Id / team2Id. Extending POST /api/matches to persist these parameters is marked: REQUIRES CLARIFICATION.

---

## Get Matches List

GET

/api/matches

Status

Defined but not yet integrated (Frontend Demo Only)

Purpose

Retrieve all matches for dashboard and match listing.

Authentication

Required

Authorization: Bearer <JWT_TOKEN>

Expected Response

HTTP 200 OK

[
    {
        "matchId":"m_101",
        "team1Name":"Hyderabad Nizampet Boys",
        "team2Name":"Hyderabad Tolichowki Boys",
        "runs":45,
        "wickets":2,
        "overs":5.2,
        "status":"LIVE"
    }
]

Errors

401

Unauthorized

---

## Get Match by ID

GET

/api/matches/{id}

Status

Defined but not yet integrated (Frontend Demo Only)

Purpose

Retrieve details for a single match by its ID.

Authentication

Required

Authorization: Bearer <JWT_TOKEN>

Expected Response

HTTP 200 OK

{
    "matchId":"m_101",
    "team1Name":"Hyderabad Nizampet Boys",
    "team2Name":"Hyderabad Tolichowki Boys",
    "runs":45,
    "wickets":2,
    "overs":5.2,
    "status":"LIVE"
}

Errors

401

Unauthorized

404

Match not found

---

## Pending Match Endpoints

- POST /api/matches/{id}/score — Defined in client, but superseded by Live Scoring event architecture — REQUIRES CLARIFICATION
- PUT /api/matches/{id} — Planned
- DELETE /api/matches/{id} — Planned
- Toss & Playing XI APIs — Planned — REQUIRES CLARIFICATION

---

# FRONTEND-ONLY FEATURES (NO BACKEND API)

The following capabilities are implemented purely on the client side and DO NOT currently have backend REST endpoints:

1. Native Share Sheet: Uses React Native Share.share to share a local team invitation message via device messaging and social apps.
2. Device Contacts Picker: Uses expo-contacts to read contacts on the user's phone to populate the Add Player modal.
3. Team QR Modal: Client-side QR presentation (TeamQRModal.tsx) displaying team name and captain initials.
4. Team A/B Selection: Client-side selection modal (TeamPickerModal.tsx) for picking Team A and Team B from existing teams with conflict prevention.

Note on Dynamic Invitation / QR Backend Service:
If dynamic invitation links, deep links, or scan-to-join token validation (e.g. POST /api/teams/{id}/invitations or POST /api/teams/join) are to be supported by the backend, they are marked: REQUIRES CLARIFICATION.

---

# LIVE SCORING

Status

Planned

POST /api/scoring/run

POST /api/scoring/wicket

POST /api/scoring/extra

POST /api/scoring/undo

GET /api/scoring/current

---

# PROFILE

Status

Planned

GET /api/profile

PUT /api/profile

POST /api/profile/logout

---

# Standard Error Response

Every API should return a consistent error object.

Example

{
    "timestamp":"2026-07-22T10:00:00",
    "status":400,
    "error":"Bad Request",
    "message":"Invalid mobile number",
    "path":"/api/auth/request-otp"
}

---

# Validation Rules

## Authentication

mobileNumber

- Required
- 10 digits
- Numeric

otp

- Required
- 5 digits
- Numeric

## Teams

name

- Required
- 1 to 100 characters
- Non-blank string

captainName

- Required
- 1 to 100 characters
- Non-blank string

## Players

name

- Required
- 1 to 100 characters
- Non-blank string

teamId

- Required
- Numeric ID matching existing team

mobileNumber (Optional)

- 10 digits numeric

jerseyNumber (Optional)

- 1 to 999 numeric

role (Optional)

- String (e.g. Batsman, Bowler, All-Rounder, Wicketkeeper)

battingStyle (Optional)

- String

bowlingStyle (Optional)

- String

---

# Security Rules

Use HTTPS in production.

Validate every request on the server.

Never trust frontend validation alone.

Never expose stack traces.

Never return sensitive information in error messages.

---

# Versioning

Current Version

v1

Future

/api/v2/

Major breaking changes require a new API version.

Future API changes should be evaluated against:

- 00_AI_ENGINEERING_HANDBOOK.md
- Existing project architecture
- Backward compatibility requirements

before implementation.

---

# Testing Checklist

For every endpoint:

- Happy path
- Invalid input
- Missing fields
- Unauthorized request
- Expired token
- Duplicate request
- Server error

---

# Change Log

Version 1.1 (September 2026)

- Synchronized API Contract with verified backend and frontend implementations.
- Updated Authentication: Documented verified JWT Bearer token authentication scheme and verified flat response schema for /api/auth/verify-otp; conservatively categorized overall authentication as partially active with Refresh Token rotation marked as PENDING / REQUIRES CLARIFICATION.
- Updated Team Module: Documented POST /api/teams and GET /api/teams as Implemented / Verified with verified payload schemas; retained GET /api/teams/{id}, PUT /api/teams/{id}, and DELETE /api/teams/{id} as pending.
- Updated Player Module: Documented POST /api/teams/{teamId}/players as Implemented / Verified with AddPlayerPayload and path parameter; retained GET /api/players, PUT /api/players/{id}, and DELETE /api/players/{id} as pending.
- Reclassified Match Module: Documented POST /api/matches, GET /api/matches, and GET /api/matches/{id} as Defined but not yet integrated (Frontend Demo Only); backend integration pending.
- Added Frontend-Only Features section: Explicitly documented Native Share Sheet, Contacts Picker, QR Modal, and Team A/B Picker to prevent fabricating backend APIs.
- Explicitly marked unverified or deferred items as REQUIRES CLARIFICATION (extended team fields, match settings persistence, dynamic QR/invite tokens, global player search, and refresh token handling).

Version 1.0

- Authentication contract added.
- OTP Request contract completed.
- OTP Verify contract completed.
- Team placeholders added.
- Match placeholders added.
- Error response standard defined.

---

# Related Documents

Use this document together with the following project documents.

## Engineering Governance

→ 00_AI_ENGINEERING_HANDBOOK.md

## Backend Implementation

→ BACKEND_GUIDELINES.md

## Frontend Integration

→ FRONTEND_GUIDELINES.md

## Coding Standards

→ CODING_STANDARDS.md

## Architecture Decisions

→ DECISIONS.md

---

End of Document

Version 1.1