# CrickHero Backend Guidelines

Version: 1.0

Status: Active

Framework: Spring Boot

---

# Purpose

This document defines the backend architecture, coding standards,
package organization and development rules for the CrickHero backend.

Every backend developer and AI assistant must follow these standards.

---
# Document Ownership

This document defines backend implementation standards only.

It should be used together with:

- 00_AI_ENGINEERING_HANDBOOK.md (engineering governance)
- API_CONTRACT.md (API specification)
- CODING_STANDARDS.md (general coding standards)

Implementation details belong here.

Project governance belongs in the Engineering Handbook.

---
# Scope

This document applies to:

- Spring Boot
- Controllers
- Services
- Repositories
- DTOs
- Entities
- Security
- JWT Authentication
- OTP Authentication
- Database Access
- Validation
- Exception Handling

This document does not define:

- Frontend implementation
- UI design
- API specifications
- Engineering governance

---

# Technology Stack

Language

- Java 21

Framework

- Spring Boot

Security

- Spring Security

Persistence

- Spring Data JPA

Database

- PostgreSQL
- Maria DB
- Java Inmemory DB(for testing)

Authentication

- JWT
- OTP

API Style

- REST

Documentation

- Swagger/OpenAPI (Future)

---

# Backend AI Workflow

Before generating backend code:

1. Read 00_AI_ENGINEERING_HANDBOOK.md.
2. Read BACKEND_GUIDELINES.md.
3. Read API_CONTRACT.md.
4. Review the existing backend implementation.
5. Reuse existing controllers, services, repositories, DTOs, and utilities whenever appropriate.
6. Generate the minimum safe change.
7. Perform a self-review before completion.
---

# Backend Philosophy

Keep business logic clean.

Keep controllers thin.

Keep services focused.

Keep repositories simple.

Prefer readability over cleverness.

---

# Recommended Package Structure

com.crichero

│

├── config

├── controller

├── service

├── repository

├── entity

├── dto

├── security

├── exception

├── util

├── mapper

├── validation

├── constants

├── enums

└── CrickHeroApplication.java

---

# Main Application Class

Place

CrickHeroApplication.java

inside the root package.

Never use the default Java package.

---

# Controller Layer

Responsibilities

✔ Accept HTTP requests

✔ Validate request DTOs

✔ Call services

✔ Return HTTP responses

Controller MUST NOT

✘ Access repositories

✘ Write business logic

✘ Contain SQL

✘ Calculate statistics

Controller methods should remain small.

---

# Service Layer

Responsibilities

✔ Business rules

✔ Transactions

✔ Orchestration

✔ Validation

✔ Calling repositories

✔ Calling external services

Service MUST NOT

✘ Return database entities directly to clients

✘ Know HTTP implementation details

---

# Repository Layer

Responsibilities

✔ Database communication

✔ CRUD

✔ Queries

Repository MUST NOT

✘ Call services

✘ Call controllers

✘ Contain business rules

---

# Entity Rules

Entities represent database tables.

Use JPA annotations.

Never expose entities directly through APIs.

Entities should not contain presentation logic.

---

# DTO Rules

Separate DTOs from entities.

Examples

Request DTO

CreateTeamRequest

VerifyOtpRequest

Response DTO

TeamResponse

AuthResponse

Never reuse entities as request objects.

---

# Validation

Use Jakarta Validation.

Examples

@NotNull

@NotBlank

@Size

@Pattern

@Email

Validation should happen before service execution.

---

# Exception Handling

Use

@ControllerAdvice

for global exception handling.

Every exception should return:

- HTTP Status
- Error Code
- Message
- Timestamp
- Path

Never expose stack traces.

---

# Security

Current

OTP Authentication

Future

JWT

Rules

- Never trust client input.
- Protect secured endpoints.
- Never hardcode secrets.
- Validate tokens.
- Store secrets outside source code.

---

# Authentication Flow

Mobile Number

↓

Request OTP

↓

Verify OTP

↓

Generate JWT

↓

Return Token

↓

Authenticated Requests

---

# API Design

REST conventions

GET

Read

POST

Create

PUT

Replace

PATCH

Partial Update

DELETE

Delete

---

# Response Format

Every successful response should follow a consistent format.

Example

{
    "message": "...",
    "data": {}
}

Every error should also follow a consistent structure.

---

# Transactions

Use @Transactional only when required.

Keep transaction scope small.

Avoid long-running transactions.

---

# Logging

Development

Use structured logs.

Production

Log

- Errors
- Warnings
- Security events

Never log

- OTP
- Passwords
- JWT
- Secrets

---

# Configuration

Store configuration in

application.yml

or

application.properties

Use profiles

dev

test

prod

Never commit production secrets.

---

# Dependency Injection

Prefer constructor injection.

Avoid field injection.

Dependencies should be final whenever possible.

---

# Database

Use PostgreSQL.

Avoid vendor-specific SQL unless necessary.

Use indexes for frequently queried columns.

Design normalized schemas first.

---

# Naming Conventions

Controller

AuthController

TeamController

Service

AuthService

TeamService

Repository

TeamRepository

DTO

CreateMatchRequest

MatchResponse

Entity

Player

Match

Team

---

# Utility Classes

Utility classes must remain stateless.

Never hide business logic inside utility classes.

---

# Mapper Layer

Entity

↓

Mapper

↓

DTO

Never manually duplicate mapping logic throughout the project.

---

# Testing

Backend testing should include

✔ Unit Tests

✔ Integration Tests

✔ API Tests

✔ Validation Tests

✔ Security Tests

---

# Performance

Avoid unnecessary database queries.

Prevent N+1 query issues.

Use pagination for large collections.

Optimize expensive operations only after measurement.

---

# API Versioning

Current

/api/

Future

/api/v2/

Breaking changes require a new API version.

---

# Documentation

Every API should be documented with

Purpose

Request

Response

Validation

Error Codes

Authentication

Examples

---

# AI Rules

When generating backend code

Always

- Follow Spring Boot best practices.
- Use constructor injection.
- Keep controllers thin.
- Follow API_CONTRACT.md.
- Follow CODING_STANDARDS.md.
- Preserve layered architecture.

Never

- Put business logic in controllers.
- Access repositories directly from controllers.
- Expose entities in APIs.
- Skip validation.
- Skip exception handling.

---

# Future Enhancements

- Redis Cache
- Flyway Database Migration
- Docker
- CI/CD
- Spring Modulith
- Event-Driven Architecture
- Audit Logging
- Observability
- Rate Limiting

Before adopting any future enhancement, evaluate it against:

- 00_AI_ENGINEERING_HANDBOOK.md
- Existing project architecture
- MVP priorities

to ensure it aligns with the project's engineering standards and roadmap.
---

# References

Prefer official documentation for

- Spring Boot
- Spring Security or API Manager WSO@ whichever completes fast.
- Spring Data JPA
- Jakarta Validation
- PostgreSQL

When project-specific standards conflict with examples,
follow this project's documented standards unless an
architectural decision updates them.

---
# Related Documents

Use this document together with the following project documents.

## Engineering Governance

→ 00_AI_ENGINEERING_HANDBOOK.md

## API Specification

→ API_CONTRACT.md

## Coding Standards

→ CODING_STANDARDS.md

## Architecture Decisions

→ DECISIONS.md

## Project Context

→ AI_PROJECT_CONTEXT.md

---

End of Document

Version 1.0