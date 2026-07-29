# UI Development Guide

## Overview

The UI layer is responsible for transforming processed application data into a clean, modern, and highly scalable user experience.

The primary objective of this dashboard is not only to display Kubernetes metrics, but also to serve as the future operational console for AI-driven infrastructure management.

The UI must therefore be designed with future scalability in mind.

Today, the application consists of approximately 3–4 pages. However, the architecture should support future expansion without requiring major restructuring.

The UI engineer is responsible only for:

- Dashboard layouts
- Component library
- Page design
- Responsive layouts
- Charts
- Navigation
- Reusable UI components
- User interactions
- Loading states
- Empty states
- Error states
- Accessibility
- Theme consistency

The UI engineer must **never perform API calls directly**.

Every page should receive already processed data from hooks or props.

---

# Design Philosophy

This dashboard should resemble an enterprise monitoring platform rather than a traditional admin panel.

The overall feeling should be

- Premium
- Professional
- Minimal
- Technical
- Clean
- Information-focused

Reference products include:

- Grafana
- Datadog
- New Relic
- OpenLens
- Lens Desktop
- Kubernetes Dashboard
- OpenShift Console

The goal is to make infrastructure metrics immediately understandable without overwhelming the user.

---

# Theme

The dashboard should use a dark enterprise theme.

Design characteristics:

- Sharp edges only
- No rounded corners
- No glassmorphism
- No gradients unless explicitly approved
- Minimal shadows
- Clean spacing
- High contrast

Suggested color palette (maximum three primary colors):

Primary:
- Slate / Stone

Secondary:
- Black / Charcoal

Accent:
- Blue (information)
or
- Emerald (healthy systems)

Status colors:

Success → Green

Warning → Amber

Critical → Red

Information → Blue

Do not introduce additional theme colors unless absolutely necessary.

---

# UI Principles

The entire UI should follow these principles:

- Consistency over creativity
- Reusability over duplication
- Readability over decoration
- Simplicity over complexity

Every new page should feel like it belongs to the same application.

---

# Component Library

The project must use:

- Shadcn UI
- Tailwind CSS
- Lucide Icons
- Recharts

Avoid mixing multiple UI libraries.

Do not introduce Material UI, Ant Design, Bootstrap, Chakra UI, or similar libraries.

---

# Component Design Rules

Every reusable UI element must become its own component.

Examples:

Metric Card

Stat Card

Chart Container

Table

Status Badge

Namespace Badge

Health Indicator

Section Header

Page Header

Sidebar

Top Navigation

Notification Panel

Approval Card

Empty State

Loading Skeleton

Error State

Confirmation Dialog

Modal

Drawer

Tooltip

Every component should be reusable across multiple pages.

No duplicated JSX.

---

# Folder Structure

The UI should follow a feature-oriented architecture.

```

src/

components/

ui/
(Button wrappers, Cards, Dialogs)

layout/
Sidebar
Topbar
PageContainer
Section
ContentWrapper

dashboard/
MetricCard
ClusterCard
CPUCard
MemoryCard
NodeCard
DeploymentCard
PodCard

charts/
BarChart
PieChart
AreaChart
LineChart
ChartContainer
ChartLegend

tables/
DeploymentTable
PodTable
NodeTable
AuditTable

notifications/
NotificationBell
NotificationPanel
NotificationItem

approval/
ApprovalCard
ApprovalModal

profile/
ProfileMenu
AvatarMenu

shared/
StatusBadge
LoadingSkeleton
EmptyState
ErrorState
SearchInput
FilterDropdown

pages/

Dashboard/

Cluster/

Deployments/

Pods/

Settings/

layouts/

hooks/

constants/

types/

utils/

assets/

styles/

```

---

# Page Structure

Every page should follow the same layout.

```

Sidebar

Top Navigation

↓

Page Header

↓

Summary Cards

↓

Charts

↓

Tables

↓

Recent Activity

```

Every page must maintain the same spacing and alignment.

---

# Sidebar

The application should contain a permanent left sidebar.

Initially include:

Dashboard

Cluster

Deployments

Pods

Settings

Future additions:

Namespaces

Nodes

Costs

AI Recommendations

Approval Center

Notifications

Audit Logs

Security

RBAC

Settings

Do not redesign the sidebar when new pages are added.

Only extend it.

---

# Top Navigation

Every page should contain a top navigation bar.

The top-right section must include:

Notification Bell

Approval Counter

Profile Avatar

Settings Shortcut

Future AI notifications will also appear here.

---

# Dashboard Layout

The dashboard page should include:

Cluster Overview

↓

Summary Metric Cards

↓

CPU & Memory Charts

↓

Node Health

↓

Deployment Health

↓

Pod Status

↓

Service Activity Feed

↓

Recent Updates

↓

AI Recommendation Placeholder

---

# Charts

Charts must be reusable.

No chart should contain business logic.

Every chart receives already processed props.

Required chart types:

Bar Chart

Pie Chart

Area Chart

Line Chart

Trend Chart

Future:

Heatmaps

Timeline Charts

Cluster Comparison Charts

Live Streaming Charts

---

# Cards

Cards should present only one responsibility.

Examples:

CPU Usage

Memory Usage

Running Pods

Deployments

Node Status

Traffic

Monthly Cost

Restart Count

Never overload a single card.

---

# Tables

Tables should be reusable.

Support:

Sorting

Filtering

Searching

Pagination

Status indicators

Expandable rows

Future support:

Virtual scrolling

Bulk actions

---

# Activity Feed

The bottom section of the dashboard should display recent cluster events.

Examples:

Deployment restarted

Node became unhealthy

Pod restarted

Traffic spike detected

Cost increased

AI Recommendation created

Approval requested

This section should later consume live backend events.

---

# Notifications

Notifications are a core feature.

Every notification should support:

Unread state

Read state

Timestamp

Priority

Category

Navigation target

Future notifications include:

AI Recommendation

Human Approval Required

Security Warning

Cluster Alert

Cost Alert

Deployment Failure

Node Failure

Pod Crash

---

# Approval Center

Future AI actions will require human approval.

Prepare reusable components now.

Each approval card should support:

Approve

Reject

View Details

Priority

Reason

Created Time

Execution History

Although the backend is not yet implemented, the UI should be ready to consume this module.

---

# Loading States

Every page must have:

Loading Skeleton

No loading spinners for entire pages.

Use skeletons wherever possible.

---

# Empty States

Every section should gracefully handle empty data.

Examples:

No deployments

No pods

No notifications

No approvals

No recommendations

Provide meaningful illustrations or icons.

---

# Error States

Never display raw errors.

Provide reusable error components.

Allow retry actions where appropriate.

---

# Responsiveness

Support:

Desktop

Laptop

Tablet

Minimum supported width:

1280px

The primary optimization target is desktop monitoring screens.

Mobile optimization is secondary.

---

# Accessibility

Support:

Keyboard navigation

Focus states

ARIA labels where required

Color contrast compliance

Meaningful icons

---

# Animations

Animations should be subtle.

Use only for:

Hover

Dropdown

Dialog

Notification

Sidebar transitions

Avoid decorative animations.

Performance takes priority.

---

# Reusability Rules

If a UI pattern appears more than once, convert it into a reusable component.

Never duplicate:

Cards

Buttons

Dialogs

Status badges

Tables

Headers

Filters

Charts

Layouts

---

# Styling Rules

Use Tailwind utility classes.

Do not write inline styles.

Avoid deeply nested conditional styling.

Centralize theme values wherever possible.

---

# Future Scalability

The current dashboard should naturally grow into an AI Operations Console.

Future modules include:

AI Recommendations

Approval Center

Audit Logs

Cluster Health

Security Dashboard

Cost Dashboard

Workflow Engine

Multi-Cluster Support

Namespaces

Node Explorer

Live Metrics

RBAC

Settings

No existing component should require major refactoring when these modules are introduced.

---

# Definition of Done

The UI implementation is considered complete only when:

- Every page follows the same layout structure.
- The design system is consistent across the application.
- All reusable components are placed in their respective folders.
- No duplicated JSX or styling exists.
- All charts are reusable and accept props only.
- The sidebar and top navigation are shared across all pages.
- Notifications and profile actions are integrated into the top navigation.
- The dashboard contains summary cards, charts, tables, and an activity feed.
- Loading, empty, and error states are implemented consistently.
- The UI is responsive for desktop and laptop screens.
- New pages can be added without modifying the existing layout.
- Future AI modules such as Approval Center and Notifications can be integrated without redesigning the application.


# Folder Strcture

src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── layouts/
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── PageContainer.tsx
│   └── Section.tsx
│
├── pages/
│   ├── Dashboard/
│   ├── Cluster/
│   ├── Deployments/
│   ├── Pods/
│   ├── AI/
│   ├── Notifications/
│   ├── Approvals/
│   └── Settings/
│
├── components/
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── ClusterOverview.tsx
│   │   └── HealthIndicator.tsx
│   │
│   ├── charts/
│   │   ├── ChartContainer.tsx
│   │   ├── CpuChart.tsx
│   │   ├── MemoryChart.tsx
│   │   ├── TrafficChart.tsx
│   │   ├── PieChart.tsx
│   │   └── BarChart.tsx
│   │
│   ├── tables/
│   │   ├── PodTable.tsx
│   │   ├── DeploymentTable.tsx
│   │   ├── NodeTable.tsx
│   │   └── EventTable.tsx
│   │
│   ├── notifications/
│   ├── approvals/
│   ├── profile/
│   ├── common/
│   └── ui/
│
├── hooks/
│   ├── useTheme.ts
│   ├── useSidebar.ts
│   ├── useNotificationPanel.ts
│   └── useDialog.ts
│
├── types/
├── constants/
├── utils/
├── assets/
├── styles/
└── lib/