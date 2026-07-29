# API Layer Development Guide

## Overview

The API layer is responsible for all communication between the frontend application and the backend services.

The UI layer must **never communicate with backend endpoints directly**.

Every request should flow through the following architecture.

```

UI Component
↓
React Hook
↓
API Service
↓
BaseService
↓
Axios Instance
↓
Backend API

```

This architecture ensures

- Loose coupling
- Easy maintenance
- Centralized error handling
- Centralized authentication
- Easy testing
- Easy migration to another backend

---

# Responsibilities

The API engineer owns the complete data layer.

This includes

- API integration
- Endpoint management
- Request handling
- Authentication
- Response transformation
- Type safety
- Error handling
- Loading states
- Retry mechanism
- Data normalization

The API engineer **must never modify UI components or dashboard layouts.**

---

# Folder Structure

The API layer should follow the following scalable structure.

```

src/

api/
axiosInstance.ts
baseService.ts

cluster/
clusterService.ts

nodes/
nodeService.ts

deployments/
deploymentService.ts

pods/
podService.ts

alerts/
alertService.ts

approvals/
approvalService.ts

notifications/
notificationService.ts

ai/
aiRecommendationService.ts

```

Each service should only contain APIs related to its own module.

Never place unrelated APIs inside the same service.

Example

✅ podService.ts

```
getPods()

getPodDetails()

restartPod()

deletePod()

getPodLogs()

```

❌ Do NOT mix

```
getClusterMetrics()

getNamespaces()

restartPod()

approveRecommendation()

```

---

# API Routes

Every endpoint must be stored inside

```
constants/apiRoutes.ts
```

Never hardcode URLs.

Example

```typescript
export const API_ROUTES = {
    CLUSTER: {
        SUMMARY: "/cluster/summary",
        HEALTH: "/cluster/health",
        METRICS: "/cluster/metrics"
    },

    PODS: {
        GET_ALL: "/pods",
        DETAILS: (podName: string) => `/pods/${podName}`,
        LOGS: (podName: string) => `/pods/${podName}/logs`
    },

    DEPLOYMENTS: {
        GET_ALL: "/deployments",
        DETAILS: (name: string) => `/deployments/${name}`
    }
}
```

---

# Service Layer

Every service should extend BaseService.

Example

```typescript
class ClusterService extends BaseService {

    async getClusterSummary() {
        return this.get<ClusterSummary>(
            API_ROUTES.CLUSTER.SUMMARY
        );
    }

}
```

No service should implement axios directly.

Only BaseService should know about axios.

---

# BaseService Responsibilities

BaseService should only handle

- GET
- POST
- PUT
- PATCH
- DELETE
- Error Handling
- Response Parsing
- Authentication Headers
- Token Refresh
- Logging
- Retry Logic

Business logic should never be added here.

---

# Response Handling

Every endpoint should return

```typescript
Promise<APIResponse<T>>
```

Never return

```
AxiosResponse

Promise<any>

unknown

```

Always use

```typescript
APIResponse<T>
```

---

# Type Safety

Never use

```typescript
any
```

Every API response must have its own type.

Store all interfaces inside

```
src/types
```

Example

```
types/

cluster.ts

node.ts

deployment.ts

pod.ts

alert.ts

approval.ts

ai.ts

index.ts

```

Each module owns its own interfaces.

Example

```typescript
export interface ClusterSummary {

    clusterId: string;

    clusterName: string;

    provider: string;

    region: string;

    cpuUtilization: number;

    memoryUtilization: number;

}
```

---

# Mapping Strategy

The backend response is considered an external contract.

UI components should never depend directly on it.

Always convert backend responses into frontend models.

Example

Backend

```json
{
    "cpuUsageMillicores":180
}
```

Mapper

```typescript
cpuUsage: "180 mCPU"
```

UI

```tsx
<MetricCard
    title="CPU Usage"
    value={deployment.cpuUsage}
/>
```

If backend changes

```
cpuUsageMillicores

↓

cpuUsed

```

Only mapper changes.

UI remains untouched.

---

# Metrics Separation

The provided JSON already suggests clear module separation.

Cluster

Responsible for

- Cluster Information
- Total CPU
- Used CPU
- Memory
- Kubernetes Version
- Provider
- Collection Timestamp

Node

Responsible for

- Node Status
- Instance Type
- CPU Usage
- Memory Usage
- Running Pods

Deployment

Responsible for

- Replicas
- Requests
- Limits
- Traffic
- Restart Count
- Monthly Cost

Pod

Responsible for

- Status
- Node
- Restart Count
- CPU Usage
- Memory Usage
- Age

These should each have their own

- Service
- Types
- Hooks
- Mappers

---

# Hooks

Create reusable hooks.

Example

```
hooks/

useCluster.ts

usePods.ts

useNodes.ts

useDeployments.ts

useApprovals.ts

```

UI components should consume hooks instead of services.

Flow

```
Dashboard

↓

useCluster()

↓

clusterService

↓

BaseService

↓

Backend

```

---

# APIResponse Usage

Every API call must check

```typescript
if(response.success){

}
```

Avoid checking

```typescript
status===200
```

inside UI components.

---

# Error Handling

Every API should gracefully handle

- Network timeout
- Unauthorized
- Forbidden
- Server Error
- Invalid Data
- Empty Data
- Parsing Error

UI should never crash because an API failed.

---

# Loading States

Each request should expose

```
loading

error

data

refresh()

```

Never use multiple boolean variables inside components.

---

# Future Scalability

The API layer should already support future modules.

Examples

```
alerts/

recommendations/

audit/

workflow/

cost/

security/

rbac/

clusters/

events/

namespaces/

```

No restructuring should be required later.

Only new services should be added.

---

# Sample API Module Organization

```
api/

baseService.ts

axiosInstance.ts

cluster/

clusterService.ts

node/

nodeService.ts

deployment/

deploymentService.ts

pod/

podService.ts

approval/

approvalService.ts

notification/

notificationService.ts

ai/

recommendationService.ts

```

---

# API Coding Standards

Every service should follow these rules.

✓ One service = One module

✓ One responsibility

✓ No duplicated endpoint

✓ No hardcoded URLs

✓ Strong typing

✓ Generic BaseService

✓ Reusable APIResponse

✓ No UI logic

✓ No JSX

✓ No formatting data for charts

✓ No formatting colors

✓ No formatting icons

✓ Only business data

---

# Future AI Workflow

The dashboard will eventually support Agentic AI.

Example workflow

AI Engine

↓

Generates Recommendation

↓

Backend stores recommendation

↓

approvalService fetches recommendation

↓

Dashboard Notification

↓

User Reviews

↓

Approve / Reject

↓

Backend executes action

↓

Audit Log updated

The API architecture should already be designed so these services can be added without changing existing modules.

---

# Definition of Done

The API layer is considered complete only when:

- Every endpoint is placed in the correct service.
- All URLs are centralized in `apiRoutes.ts`.
- Every request uses `BaseService`.
- No component imports `axios`.
- Every response is strongly typed.
- Backend responses are mapped into frontend models.
- Error handling is centralized.
- Loading states are exposed consistently.
- Services remain independent and reusable.
- New API modules can be added without modifying existing services.


# Folder Strcuture

src/
 ├── api/
 │   ├── core/
 │   │   ├── axiosInstance.ts
 │   │   ├── baseService.ts
 │   │   └── apiRoutes.ts
 │   ├── cluster/
 │   │   ├── clusterService.ts
 │   │   ├── clusterMapper.ts
 │   │   └── cluster.types.ts
 │   ├── nodes/
 │   ├── deployments/
 │   ├── pods/
 │   ├── approvals/
 │   ├── notifications/
 │   └── ai/
 ├── hooks/
 │   ├── useCluster.ts
 │   ├── useNodes.ts
 │   ├── useDeployments.ts
 │   └── usePods.ts
 ├── types/
 └── components/