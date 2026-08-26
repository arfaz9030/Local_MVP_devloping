# CrickHero API Contract

**Version:** 1.0

**Status:** Active

**API Version:** v1

**Base URL (Development):**

http://localhost:2020

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

Current

OTP Authentication

Future

JWT Bearer Token

Authorization Header

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

---

## Request OTP

POST

/api/auth/request-otp

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

Purpose

Verify OTP and authenticate user.

Request

{
    "mobileNumber":"9876543210",
    "otp":"57676"
}

Validation

OTP required

5 digits

Success Response

(Current backend response)

To be finalized after JWT implementation.

Future Response

{
    "message":"Login Successful",
    "token":"JWT_TOKEN",
    "refreshToken":"REFRESH_TOKEN",
    "user":{
        "id":1,
        "mobileNumber":"9876543210"
    }
}

Errors

400

Invalid OTP

401

OTP expired

---

# TEAM MODULE

Status

Planned

Endpoints

POST /api/teams

GET /api/teams

GET /api/teams/{id}

PUT /api/teams/{id}

DELETE /api/teams/{id}

---

# PLAYER MODULE

Status

Planned

POST /api/players

GET /api/players

PUT /api/players/{id}

DELETE /api/players/{id}

---

# MATCH MODULE

Status

Planned

POST /api/matches

GET /api/matches

GET /api/matches/{id}

PUT /api/matches/{id}

DELETE /api/matches/{id}

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

Authentication

mobileNumber

Required

10 digits

Numeric

OTP

Required

5 digits

Numeric

Future modules should document validation for every request field.

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

Version 1.0