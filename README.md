# Thalify: Your daily meals, on your terms.

> **One-Line Pitch:** A high-reliability subscription management platform for tiffin services, PG messes, and daily meal subscribers that eliminates notebook disputes through server-authoritative cutoff enforcement, derived billing, and real-time kitchen prep orchestration.

---

## 1. Problem Statement

Home kitchens, PG messes, and independent tiffin businesses across India run everyday operations on disjointed WhatsApp messages, phone calls, and paper notebooks. 

This status-quo causes three recurring points of failure:
1. **Billing Disputes & Lost Revenue:** Customers notify skips late or forget when they skipped meals. At the end of the month, providers and customers argue over the bill because there is no single immutable source of truth.
2. **Kitchen Overcooking & Food Waste:** Providers do not know the exact tomorrow headcount until late at night. Without automated aggregation, kitchens either overcook (wasting expensive raw ingredients) or under-serve.
3. **Delivery Miscommunication:** Delivery staff receive unorganized verbal route instructions with zero recorded proof of failed drops, leaving disputes over whether a missed meal is billable.

---

## 2. Target Users

- **Customers:** College students, working professionals, and PG residents eating daily from local mess/tiffin providers who want reliable skipping, pausing, and transparent itemized monthly bills.
- **Providers / Kitchen Owners:** Home chefs, mess managers, and cloud kitchens who require tomorrow's guaranteed headcount before purchasing groceries, plus an automated billing ledger.
- **Delivery Partners:** Staff employed by providers who need a simplified mobile drop checklist to mark deliveries completed or failed with reason codes.

---

## 3. Market Gap Analysis

| Product / Solution | What It Does Well | What It Lacks for This Use Case | Sources & Citations |
| :--- | :--- | :--- | :--- |
| **Swiggy / Zomato** | On-demand one-off food ordering, real-time live GPS tracking | No true recurring meal subscription control; 25–35% commission unaffordable for small daily messes; not built for a kitchen's owned recurring customer base. | [Swiggy Partner T&C](https://www.swiggy.com), [Zomato Restaurant Partner Commission Structure](https://www.zomato.com) |
| **WhatsApp + Notebook (Status Quo)** | Zero onboarding cost; universally adopted communication tool | No cutoff enforcement; prone to late-night arguments; zero automated headcount aggregation; no delivery verification audit trail. | Industry field interviews with Bengaluru PG messes (Koramangala, Whitefield) |
| **Generic Invoicing Apps (Vyapar / Khatabook)** | General ledger recording, PDF invoices | Not meal-schedule aware; cannot enforce skip deadlines prior to cooking; zero kitchen prep aggregation or delivery assignment workflow. | [Vyapar App Features](https://vyaparapp.in), [Khatabook Merchant Terms](https://khatabook.com) |

**Our Differentiator:** Thalify enforces **server-side cutoff validation in IST**, guarantees **mathematically derived billing** directly from materialized meal instances, and gives kitchen owners a **real-time headcount prep engine** connected live via WebSockets.

---

## 4. Key Roles & Features

### 👤 Customer Portal
- **Browse Kitchens:** Filter verified home messes by delivery area (Koramangala, HSR Layout, Whitefield, etc.).
- **Subscribe to Plans:** Choose duration (7, 15, 30 days), diet (Veg / Non-Veg), meal slot (Lunch, Dinner, Both), and starting date.
- **14-Day Rolling Meal Calendar:** View daily meals with live status badges.
- **Server-Enforced Skip & Undo:** Skip upcoming meals before the kitchen's cutoff time (e.g. 20:00 IST previous day) with 1-click credits.
- **Pause & Resume Date Range:** Vacation mode (up to 30 days) that bulk-skips unlocked meals and reports locked ones.
- **Itemized Monthly Ledger:** View exact line-item breakdowns of every delivered meal, skip credit savings, and UPI payments.
- **Live WebSocket Drop Notification:** Real-time audio and visual alerts when the rider delivers at the doorstep.

### 🍳 Provider / Kitchen Owner Portal
- **Operations Dashboard:** Live overview of tomorrow's cook headcount, today's drop progress, and outstanding unpaid balance.
- **Kitchen Prep Engine (BR-7):** Automated headcount aggregator by diet (Veg vs. Non-Veg), meal type, and route area with a **Printable Kitchen Order Ticket (KOT)**.
- **Delivery Dispatch Board:** Group today's drops by area, assign route batches to delivery staff, and monitor live delivery completions.
- **Billing & Collections Ledger:** Pay-after-consumption tracking with an **Overpayment Prevention Guard** (`409 OVERPAYMENT`).
- **Menu & Plan Studio:** Create weekly rolling menus and multi-day meal subscription packages.

### 🚴 Delivery Partner Portal
- **Mobile Drop Board:** View today's assigned meal drops grouped by service sector.
- **1-Click Status Toggles:** Large "Delivered" and "Failed" buttons with terminal lock state (`409 ALREADY_FINALIZED`).
- **Reason Selector for Failed Drops:** Select between `customer_unavailable` (billable) and `provider_fault` (credited to customer).

---

## 5. Technology Stack

- **Frontend:** React 18 (Vite), React Router v6, Tailwind CSS, Lucide Icons, React Hot Toast
- **Backend API:** Node.js, Express 4 (ES Modules architecture)
- **Database:** MongoDB Atlas / Local MongoDB via Mongoose ODM
- **Real-Time Communication:** Socket.io (WebSocket client-server synchronization)
- **Job Scheduling:** `node-cron` (configured strictly in `Asia/Kolkata` timezone)
- **Security & Validation:** JWT (JSON Web Tokens), bcryptjs (10 salt rounds), Zod schema validation, Helmet, CORS, Express Mongo Sanitize, Express Rate Limit
- **Testing:** Jest, Supertest, MongoDB Memory Server

---

## 6. Architecture & System Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT LAYER                                 │
│                   React 18 + Vite + Tailwind CSS                            │
│  [Customer Portal]        [Provider Prep & Dispatch]     [Delivery Drop UI] │
│          │                              │                          │        │
│          ▼                              ▼                          ▼        │
│      REST (Axios)                 REST (Axios)               REST (Axios)   │
│          │                              │                          │        │
└──────────┼──────────────────────────────┼──────────────────────────┼────────┘
           │                              │                          │
           ▼                              ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             API GATEWAY LAYER                               │
│  Express 4 App • Helmet • Mongo Sanitize • Rate Limiter • Zod Validator     │
│  Auth Middleware (JWT Verify) • Role-Based RBAC • Resource Ownership Check  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS SERVICE LAYER                            │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐ │
│  │ cutoff.service.js    │  │ mealGenerator.js     │  │ billing.service.js │ │
│  │ Server IST deadline  │  │ 7-day rolling window │  │ Math derivation    │ │
│  │ Concurrency lock     │  │ Idempotent upserts   │  │ Overpayment guard  │ │
│  └──────────────────────┘  └──────────────────────┘  └────────────────────┘ │
│  ┌──────────────────────┐  ┌──────────────────────┐                         │
│  │ prep.service.js      │  │ delivery.service.js  │                         │
│  │ Headcount aggregator │  │ Route assignment     │                         │
│  │ isLocked state       │  │ State transitions    │                         │
│  └──────────────────────┘  └──────────────────────┘                         │
└──────────────────────┬──────────────────────┬───────────────────────────────┘
                       │                      │
       ┌───────────────┘                      └────────────────┐
       ▼                                                       ▼
┌──────────────────────────────┐              ┌───────────────────────────────┐
│     PERSISTENCE LAYER        │              │       REAL-TIME & JOBS        │
│        MongoDB               │              │                               │
│  • Compound unique indexes   │              │  Socket.io:                   │
│  • Immutability snapshots    │              │  • delivery:update            │
│  • NoSQL safe sanitize       │              │  • prep:changed               │
│                              │              │                               │
│                              │              │  node-cron (Asia/Kolkata):    │
│                              │              │  • 00:05 Extend 7-day horizon │
│                              │              │  • 00:10 Expire subscriptions │
│                              │              │  • 06:00 Generate drop tasks  │
└──────────────────────────────┘              └───────────────────────────────┘
```

### Architectural Highlights by Layer:
1. **Client Layer:** Modular React frontend with strict role-based route gating (`ProtectedRoute`), instantaneous 1-click evaluator role switching (`DemoBar`), and dynamic Socket.io event listeners that invalidate and refetch stale queries.
2. **API & Security Layer:** All route payloads and queries pass through declarative **Zod schemas** before reaching controllers. Malformed ObjectIds yield explicit `400 VALIDATION_ERROR` rather than unhandled 500 crashes.
3. **Service Layer:** Controllers are lightweight orchestrators. Complex business logic lives entirely inside pure, testable service functions (`cutoff.service.js`, `billing.service.js`, `mealGenerator.service.js`).
4. **Data Layer:** Schema design relies on compound unique indexes `(subscriptionId, date, mealType)` and `(providerId, date, mealType)` making all writes naturally idempotent.

---

## 7. Key Engineering Decisions

### 1. Server-Side Cutoff Enforcement (BR-4)
- **Problem:** If skip deadlines are computed on the client device, users can manipulate their phone’s clock to skip meals after the kitchen has already purchased ingredients and begun cooking.
- **Decision:** The cutoff check lives exclusively on the server (`cutoff.service.js`) evaluated against `Asia/Kolkata` server time. The formula `skipDeadline = (meal.date - 1 day) at provider.cutoffTime (IST)` is verified inside an atomic MongoDB operation:
  ```js
  await MealInstance.findOneAndUpdate(
    { _id: mealId, status: 'scheduled' },
    { status: 'skipped', skipReason: 'user' }
  );
  ```
  This ensures that two concurrent requests cannot race to skip or corrupt a single meal.

### 2. Materialized MealInstances (BR-3)
- **Problem:** Dynamically calculating daily headcounts, pauses, and skipped bills from recurring rule formulas becomes slow, bug-prone, and fragile when plan parameters change.
- **Decision:** Subscriptions materialize concrete `MealInstance` documents across a rolling 7-day window. Kitchen prep aggregation and delivery tasks are simple, indexed database queries (`index: { providerId: 1, date: 1, status: 1 }`).

### 3. Derived Billing Ledger (BR-11)
- **Problem:** Storing mutable `totalAmountDue` or `balance` accumulators causes financial drift whenever edge-case cancellations or failure status updates occur.
- **Decision:** Billing is computed on-the-fly directly from immutable historical meal records:
  $$\text{Charged} = \sum \text{Price}(\text{Delivered}) + \sum \text{Price}(\text{Failed with } \text{customer\_unavailable})$$
  $$\text{Credits} = \sum \text{Price}(\text{Skipped}) + \sum \text{Price}(\text{Cancelled}) + \sum \text{Price}(\text{Failed with } \text{provider\_fault})$$
  $$\text{Balance} = \max(0, \text{Charged} - \text{Paid})$$

### 4. Snapshotted Pricing (BR-14)
- When a `MealInstance` is generated, it captures `plan.pricePerMeal` into `mealInstance.price`. Future price changes by a provider never retroactively alter past bills.

### 5. Idempotent Background Cron Workers (Section 22)
- All background tasks are idempotent. If a daily cron fails or is triggered manually via `/provider/delivery/generate`, compound unique indexes prevent duplicate tasks.

---

## 8. Local Setup & Installation

### Prerequisites
- Node.js >= v18.0.0
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/tiffinloop.git
cd tiffinloop
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/tiffinloop
JWT_SECRET=tiffinloop_secret_dev_key_super_secure_12345
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TZ=Asia/Kolkata
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string).*

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Seed the Database
Populates 2 mess providers, 6 plans, rolling menus, delivery riders, 8 customers, and 14 days of realistic past delivery and billing history:
```bash
cd server
npm run seed
```

### 5. Run the Application
In terminal 1 (Backend API):
```bash
cd server
npm run dev
```

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 9. Demo Credentials

| Role | Email | Password | Persona & Focus |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `Demo@1234` | **Rohan Sharma**: Has an active 30-day subscription, past skips, paused dates, and an itemized monthly bill. |
| **Provider** | `provider@demo.com` | `Demo@1234` | **Sunita Sharma (Maa Ki Rasoi)**: Controls kitchen prep sheet, delivery dispatch board, menus, and payments. |
| **Delivery** | `delivery@demo.com` | `Demo@1234` | **Ramesh Kumar**: Assigned to Koramangala route. Can mark drops Delivered or Failed with reason codes. |

> 💡 **Evaluator Tip:** Use the persistent **"Evaluator Demo Switcher"** bar at the top of the screen to switch between Customer, Provider, and Rider with a single click without logging in/out manually!

---

## 10. Automated Test Suite

Run the full acceptance test suite:
```bash
cd server
npm test
```
The test suite validates:
1. Public registration restricts `delivery` role escalation (`400 VALIDATION_ERROR`)
2. Duplicate email registration returns `409 EMAIL_EXISTS`
3. Cross-user subscription access returns `403 FORBIDDEN`
4. Past start dates for subscriptions return `400 VALIDATION_ERROR`
5. Overlapping active subscriptions to the same plan return `409 DUPLICATE_SUBSCRIPTION`
6. Subscribing generates meal instances matching plan days of the week
7. Rerunning generation is strictly idempotent with zero duplicates
8. Skipping before deadline reduces headcount and updates billing
9. Skipping after deadline returns `409 CUTOFF_PASSED` with deadline details
10. Skipping an already delivered meal returns `409 INVALID_STATE`
11. Pausing skips unlocked meals and reports locked ones
12. Resuming restores meals to scheduled
13. Kitchen prep aggregation matches manual counts
14. Delivery partner cannot update a task assigned to someone else (`403`)
15. Failure with `customer_unavailable` is billable; `provider_fault` is credited
16. Monthly bill math matches itemized lines
17. Overpayment returns `409 OVERPAYMENT`

---

## 11. Viva & Evaluator Defense Questions (PRD Section 30)

#### Q1: Why materialize MealInstances instead of computing from rules on-the-fly?
**Answer:** Materializing meal instances transforms what would be an expensive, recursive schedule calculation into simple, indexed database lookups (`O(1)` query per date). Most importantly, each meal needs its own unique lifecycle state (`scheduled`, `skipped`, `delivered`, `failed`), an individual failure reason, and a snapshot of the plan price at the moment of subscription.

#### Q2: How do you stop two simultaneous skip requests from corrupting data?
**Answer:** We perform atomic database transitions using MongoDB's `findOneAndUpdate` with `{ _id, status: 'scheduled' }` in the query filter. If two requests hit the server concurrently, the first request matches the `scheduled` filter and changes the status to `skipped`; the second request immediately fails to match the filter and receives an explicit `409 INVALID_STATE`.

#### Q3: Where is the cutoff enforced and why?
**Answer:** The cutoff is strictly validated server-side in `services/cutoff.service.js` against server time converted to `Asia/Kolkata`. Client timestamps cannot be trusted because any user can adjust their device time to bypass deadlines.

#### Q4: How does the bill stay correct if a provider increases their plan price?
**Answer:** Each `MealInstance` document contains a `price` integer that is snapshotted from `plan.pricePerMeal` at the time of generation. When a provider updates their plan price, only future generated instances capture the new price; historical records remain immutable.

#### Q5: How do you prevent privilege and role escalation?
**Answer:** Public registration allows only `customer` or `provider`. Delivery accounts cannot be registered publicly; they can only be provisioned by a verified provider through the protected `/provider/staff` endpoint, which forces `role = 'delivery'` and sets `providerId` to the authenticated owner's ID.

#### Q6: What happens if a daily background cron job misses a run or the server restarts?
**Answer:** The background workers are idempotent and cover a rolling 7-day horizon. When the server reboots or the job runs next, it queries what is missing and fills the gap. Furthermore, kitchen owners can manually trigger `/provider/delivery/generate` at any time without creating duplicates.

#### Q7: What would you add in a future production release?
**Answer:**
- Razorpay / Cashfree webhook payment gateway integration
- WhatsApp Business Cloud API automated daily morning push notifications
- TSP route optimization (Traveling Salesperson Problem) for delivery riders using Google Maps Directions API
- Customer meal ratings and feedback analytics

---

## 12. Deployment Instructions

### Backend (Render)
1. Create a **Web Service** pointing to your repository with root directory `server`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (set to your Vercel URL), `TZ=Asia/Kolkata`.

### Frontend (Vercel)
1. Create a **Project** pointing to the repository with root directory `client`.
2. Framework preset: **Vite**
3. Set environment variables: `VITE_API_URL` and `VITE_SOCKET_URL` (pointing to your Render URL).
4. `vercel.json` rewrite is pre-configured to ensure seamless React Router page reloads.

---

## 13. Credits & AI Tools Usage
- Built with **Node.js, Express, React, and Tailwind CSS**.
- Icons provided by **Lucide React**.
- AI tools were utilized during development for code generation, schema drafting, and test scenario planning in accordance with Section 15 of the End-Term Submission Guidelines.
