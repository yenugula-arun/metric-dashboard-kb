README Creation Prompt

Create a professional, production-ready README.md for a project named Kubernetes Metrics Dashboard.

This README should not be a simple project description. It should serve as the complete implementation guide for two engineers working independently on the same project.

The README should be detailed, practical, and scalable, similar to enterprise software documentation.

Project Overview

The project is a Kubernetes Metrics Dashboard that visualizes metrics collected from Kubernetes clusters.

Initially the project contains around 3–4 dashboard pages, but it is designed to scale into an Agentic AI platform where AI agents continuously monitor the infrastructure and request human approval before executing actions.

Therefore, the architecture, folder structure, coding style, and component organization must all support long-term scalability.

The dashboard is not just for displaying metrics.

In future versions it will support

AI Recommendations
Human Approval Workflow
Notifications
Action History
Cluster Operations
Cost Optimization
Security Recommendations
AI Decision Logs

The current implementation should already prepare the codebase for these future capabilities.

Team Structure

There are two developers working on this project.

The README must clearly separate their responsibilities.

Engineer 1

Frontend UI Engineer

Responsible only for

UI Design
Page Layouts
Responsive Design
Charts
Reusable Components
Theme
User Experience

This engineer must never worry about API implementation.

All UI should consume already processed data.

Engineer 2

Frontend API Engineer

Responsible only for

API Integration
Service Layer
Data Fetching
API Response Handling
Error Handling
Data Transformation
State Management
Passing clean data into UI components

This engineer must never modify UI design.

The UI should receive only presentation-ready data.

Technology Stack

Mention that the project uses

React
TypeScript
Vite
Shadcn UI
Tailwind CSS
React Query (recommended)
Axios (or Fetch with wrapper)
React Router
Recharts

The README should explain why each technology is used.

UI Design Requirements

The dashboard should follow a modern enterprise observability style.

The README should include UI design principles.

Requirements

Sharp edges only
No rounded cards
No rounded buttons
No rounded tables

Theme

Dark professional dashboard.

Primary colors should be limited to only 3 colors.

Suggested palette

Stone

Slate

Black

or any professional enterprise color combination that gives the appearance of premium monitoring software.

The dashboard should feel similar to

Grafana

Datadog

New Relic

Lens

OpenLens

OpenShift Console

The README should explain

Spacing

Typography

Icons

Cards

Tables

Charts

Navigation

Hover effects

Loading states

Empty states

Error states

Skeleton loading

Responsive behavior

Component consistency

Charts

The README should explain how charts should be implemented.

Examples

Bar Charts

Pie Charts

Area Charts

Line Charts

Realtime CPU Usage

Memory Usage

Cost Trend

Namespace Distribution

Node Health

Pod Status

Charts should be reusable components.

No chart should directly consume API responses.

Charts should receive only processed props.

Folder Structure

The README should explain the complete scalable folder structure.

Separate

components

layouts

pages

services

hooks

utils

constants

types

contexts

assets

routes

config

Each folder should include its responsibility.

Type Safety

Explain that every API response should first be converted into TypeScript types.

Never use

any

Types should be stored inside

types/

If API fields change in the future,

only the type definitions and mapper functions should require modification.

The rest of the application should continue working without changes.

This is one of the most important design principles.

API Layer Instructions

Create a complete implementation guide for the API Engineer.

Explain

API folder structure

Endpoint organization

Request utilities

Response wrappers

Error handling

Loading state

Retry strategy

Pagination support

Authentication support

Environment variables

Centralized API client

Mapper functions

DTO transformations

Data normalization

Caching strategy

The README should strongly emphasize

Never expose raw API responses directly to UI components.

Always transform responses into clean domain models before rendering.

API Response Strategy

Mention that every API response should follow a standard response wrapper.

Explain how response models should be handled.

Explain

Success

Failure

Error

Loading

Empty State

Unknown State

The README should include best practices for scalable API handling.

State Management

Recommend

React Query

or another scalable approach.

Explain where

server state

and

UI state

should live.

Component Design

The README should explain

Atomic component design

Reusable cards

Reusable tables

Reusable filters

Reusable chart wrappers

Reusable badges

Reusable status chips

Reusable dialogs

Reusable confirmation modals

Reusable notification components

Scalability

The README should explain how the project should evolve without requiring folder restructuring.

Future modules may include

AI Recommendations

Approval Center

Notification Center

Audit Logs

Cluster Management

Policy Engine

Security Dashboard

Cost Dashboard

Settings

User Management

Role Management

All architecture decisions should support these future modules.

Human Approval Workflow

Explain future support for

AI generates recommendations.

Recommendations appear inside the dashboard.

Human reviews them.

Approve

Reject

View Details

Audit History

This feature is not implemented today.

However, the architecture should already support it.

Development Rules

Include strict coding guidelines.

Examples

No duplicate logic

No inline API calls

No inline chart logic

No hardcoded colors

No hardcoded strings

Use constants

Use reusable hooks

Reusable utility functions

Strict typing

Reusable interfaces

Meaningful naming

Small reusable components

Single Responsibility Principle

Performance

Explain

Lazy loading

Memoization

Code splitting

React Query caching

Virtualization

Reusable selectors

Minimal rerenders

Error Handling

Explain

API errors

UI errors

Chart errors

Network failures

Authentication failures

Retry strategy

Fallback UI

Future Enhancements

Document future roadmap.

Examples

Multi-cluster Support

Real-time Streaming

WebSockets

Kafka

AI Agents

Predictive Analysis

RBAC

Audit Logs

Notification Center

Workflow Engine

Approval Queue

Cluster Health Score

Cost Optimization

Definition of Done

Create separate Definition of Done sections for

API Engineer

and

UI Engineer.

Each engineer should know exactly when their task is considered complete.