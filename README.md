# Thalify: Your daily meals, on your terms.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-black?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47a248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-WebSockets-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0c2340?style=for-the-badge&logo=razorpay&logoColor=white)
![Tests](https://img.shields.io/badge/Acceptance%20Tests-18%2F18%20Passed%20(100%25)-brightgreen?style=for-the-badge)

<p align="center">
  <strong>An enterprise-grade subscription and kitchen prep orchestration platform designed for daily tiffin services, PG messes, and home kitchens.</strong><br>
  Eliminates paper notebook disputes through server-authoritative cutoff enforcement, derived billing, real-time WebSocket dispatch, and integrated online payments.
</p>

</div>

---

## 1. Problem Statement & Real-World Domain Analysis

In Indian metropolitan hubs and educational epicenters—such as Bengaluru, Pune, Kota, Hyderabad, and Gurugram—over **15 million students, young professionals, and PG residents** rely on daily home tiffins and private messes for their lunch and dinner. 

Despite being a multi-billion-rupee daily essential services economy, over **90% of tiffin providers operate entirely on manual notebooks, phone calls, and chaotic WhatsApp messages**.

```
    Traditional Workflow (Status Quo) — Chaotic & Prone to Revenue Loss:

  Subscriber                 WhatsApp / Phone Call                Mess Owner Notebook
 ┌──────────┐         "Bhaiya kal tiffin mat bhejna"          ┌─────────────────────────┐
 │ Customer │ ──────────────────────────────────────────────> │ • Scribbled tally marks │
 └──────────┘            (Sent at 11:30 PM at night)          │ • Unrecorded messages   │
                                                              │ • Guesswork cooking qty │
                                                              └────────────┬────────────┘
                                                                           │
                                  End of Month: Disputed Ledger            ▼
                                 "Maine 6 meal skip kiya tha!"     "Khaate mein 2 hi hai"
```

### The Three Critical Systemic Failures in Daily Tiffin Operations:

1. **The "End-of-Month Notebook War" (Billing Disputes & Revenue Loss):**
   Subscribers send last-minute WhatsApp messages like *"Bhaiya kal dopahar mat bhejna"*. Kitchen owners, occupied with cooking or deliveries, forget to update physical registers. At month's end, customers claim they skipped 8 meals, while the provider recorded only 3. Without an immutable, single source of truth, both parties suffer distrust and financial loss.

2. **Kitchen Overcooking & Raw Material Wastage (15–20% Ingredient Loss):**
   Messes must purchase fresh vegetables, dairy, and grains at 6:00 AM wholesale markets. Without an automated aggregation system, chefs cook based on guesswork. When subscribers skip without timely notice, expensive cooked food is thrown away.

3. **Undocumented Delivery Drops & Blame Games:**
   Delivery riders carry disorganized paper lists. If a subscriber isn't home or locked their gate, the rider leaves without verifiable proof. The customer later demands a full refund, leaving the kitchen to absorb the loss.

---

## 2. Market Gap & Product Philosophy

| Solution Category | What It Does Well | What It Lacks for Daily Tiffins | Why Thalify Wins |
| :--- | :--- | :--- | :--- |
| **On-Demand Delivery (Swiggy / Zomato)** | Fast one-off ordering, live GPS delivery map | 25–35% commission makes daily ₹80–₹120 thalis economically impossible; no calendar-based subscription pausing. | **Zero-commission platform** built specifically for recurring meal subscribers and owned kitchen customer bases. |
| **Status Quo (WhatsApp + Paper Diaries)** | Zero learning curve; universally adopted | Zero cutoff enforcement; late-night disputes; no headcount forecasting; no audit trail. | **Server-authoritative 5:00 PM cutoff** and tamper-proof digital ledger. |
| **Generic Invoicing (Vyapar / Khatabook)** | General ledger balance tracking and PDF receipts | Not meal-schedule aware; cannot aggregate daily kitchen prep headcounts; zero delivery workflow. | **End-to-end operational integration** connecting ordering, cooking, delivery, and payments. |

---

## 3. Key Product Features & Core Workflows

### 👤 1. Customer Subscription & Meal Calendar
- **Interactive 3D Brass Thali Showcase:** Interactive 3D brass thali preview displaying authentic regional dishes (Dal Makhani, Shahi Paneer, Phulkas, Basmati Rice, Gulab Jamun).
- **Curated Kitchen Exploration:** Browse and filter verified home kitchens across Koramangala, HSR Layout, Whitefield, BTM Layout, and Jayanagar with cuisine tags (North Indian, South Indian, Pure Jain & Satvik, High-Protein Gym Fuel).
- **7-Day Revolving Daily Menu Explorer:** View daily menus organized strictly by calendar date in a unified day box showing both **☀️ Lunch** and **🌙 Dinner** together.
- **Cutoff-Enforced Skip & Undo (BR-4):** Skip any upcoming meal before 5:00 PM IST with 1-click credits. Undo any skip before 5:00 PM; strictly locked with `409 CUTOFF_PASSED` after 5:00 PM.
- **Vacation Mode (Pause / Resume):** Bulk-pause up to 30 days of upcoming meals without manual daily toggling.
- **Integrated Razorpay Payments:** Clear outstanding balances with live UPI/Card checkout, overpayment prevention guards, and instant receipts.

### 🍳 2. Kitchen Operations & Prep Engine
- **Headcount Aggregator (BR-7):** Automatically tallies tomorrow's lunch and dinner requirements broken down by diet (Veg vs. Non-Veg).
- **Printable Kitchen Order Ticket (KOT):** 1-click print-optimized KOT for kitchen cooks.
- **Live WebSocket Customer Skip Feed:** Real-time push alert notifies the chef the instant a subscriber skips a meal.
- **Customer Subscriber Directory:** Complete directory of active subscribers with 1-click direct WhatsApp messaging and broadcast announcements.
- **Custom Cutoff Deadlines & Rotating Menus:** Configure delivery sectors, custom cutoffs, and 7-day rolling menus organized by date.

### 🚴 3. Delivery Route Dispatch Board
- **Sector Route Grouping:** Daily delivery tasks automatically clustered by neighborhood (Koramangala, HSR, BTM).
- **1-Click Mobile Drop Execution:** Large touch buttons for "Delivered" and "Failed".
- **Terminal State Machine (BR-9):** Prevents tampering once marked (`409 ALREADY_FINALIZED`).
- **Audited Failure Reasons:** Distinguishes between `customer_unavailable` (billable to customer) and `provider_fault` (credited to customer).

---

## 4. Technical Architecture & System Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT LAYER                                   │
│                  React 18 (Vite) + Tailwind CSS + Lucide Icons                  │
│                                                                                 │
│   ┌─────────────────────┐   ┌──────────────────────┐   ┌────────────────────┐   │
│   │   Customer Portal   │   │  Kitchen Operations  │   │  Rider Drop Board  │   │
│   │ • 3D Thali Showcase │   │ • Prep Headcount     │   │ • Sector Routes    │   │
│   │ • 14-Day Calendar   │   │ • Printable KOT      │   │ • 1-Click Status   │   │
│   │ • Skip & Undo Engine│   │ • Live Skip Feed     │   │ • Reason Logger    │   │
│   │ • Razorpay Checkout │   │ • WhatsApp Broadcast │   │ • Locked State     │   │
│   └──────────┬──────────┘   └──────────┬───────────┘   └─────────┬──────────┘   │
└──────────────┼─────────────────────────┼─────────────────────────┼──────────────┘
               │                         │                         │
               ▼ REST (Axios)            ▼ REST (Axios)            ▼ REST (Axios)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                API GATEWAY LAYER                                │
│        Express 4 (ESM) • Helmet Security • Rate Limiter • Mongo Sanitize        │
│          JWT Authentication • Role-Based RBAC • Zod Schema Validation           │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             BUSINESS SERVICES LAYER                             │
│                                                                                 │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐ │
│  │   cutoff.service.js   │  │ mealGenerator.service │  │  billing.service.js  │ │
│  │ • 5:00 PM IST check   │  │ • 7-day rolling window│  │ • Mathematical math  │ │
│  │ • Atomic state lock   │  │ • Idempotent upserts  │  │ • Overpayment guard  │ │
│  └───────────────────────┘  └───────────────────────┘  └──────────────────────┘ │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐ │
│  │    prep.service.js    │  │  delivery.service.js  │  │ razorpay.controller  │ │
│  │ • Headcount aggregate │  │ • Route clustering    │  │ • Order creation     │ │
│  │ • Diet breakdown      │  │ • Terminal lock (409) │  │ • Verification logic │ │
│  └───────────────────────┘  └───────────────────────┘  └──────────────────────┘ │
└──────────────────────────┬──────────────────────────┬───────────────────────────┘
                           │                          │
           ┌───────────────┘                          └───────────────┐
           ▼                                                          ▼
┌──────────────────────────────────────┐          ┌───────────────────────────────┐
│          PERSISTENCE LAYER           │          │    REAL-TIME & BACKGROUND     │
│        MongoDB Atlas / Local         │          │                               │
│  • Users, Providers, Plans, Menus    │          │  Socket.io WebSockets:        │
│  • MealInstances, DeliveryTasks      │          │  • customer:skipped (alert)   │
│  • Payments & Ledger Snapshots       │          │  • prep:changed (headcount)   │
│  • Dual-Engine Resilience Engine     │          │  • delivery:update (drop)     │
│  • Compound unique indexes           │          │                               │
│    (subscriptionId, date, mealType)  │          │  node-cron (Asia/Kolkata):    │
│    (providerId, date, mealType)      │          │  • 00:05 Extend 7-day horizon │
│                                      │          │  • 00:10 Expire subscriptions │
└──────────────────────────────────────┘          └───────────────────────────────┘
```

---

## 5. Data Model & Entity Relationships

The database architecture is designed with MongoDB compound unique indexes to guarantee idempotency and referential integrity:

```
┌──────────────┐         1:1         ┌──────────────────┐
│     User     │ ──────────────────> │     Provider     │
│ (Auth & Role)│                     │  (Kitchen Info)  │
└──────┬───────┘                     └────────┬─────────┘
       │                                      │ 1:N
       │ 1:N                                  ▼
       │                             ┌──────────────────┐
       │                             │       Plan       │
       │                             │(Pricing & Diet)  │
       │                             └────────┬─────────┘
       ▼                                      │
┌──────────────┐         1:N                  │ 1:N
│ Subscription │ <────────────────────────────┘
│ (Active Term)│
└──────┬───────┘
       │
       │ 1:N Materialized
       ▼
┌────────────────────────────────────────────────────────┐
│                      MealInstance                      │
│ • date (YYYY-MM-DD)                                    │
│ • mealType ('lunch' | 'dinner')                        │
│ • status ('scheduled' | 'skipped' | 'delivered' | 'failed')
│ • price (Snapshotted integer)                          │
│ • billable (boolean derived flag)                      │
│ Compound Index: { subscriptionId: 1, date: 1, mealType: 1 } (Unique)
└──────┬─────────────────────────────────────────────────┘
       │
       │ 1:1 (When offset = 0)
       ▼
┌──────────────────────────────┐          ┌─────────────────────────────┐
│         DeliveryTask         │          │           Payment           │
│ • assignedTo (Rider User ID) │          │ • subscriptionId            │
│ • status ('pending'|'done')  │          │ • month (YYYY-MM)           │
│ • failureReason              │          │ • amount (in INR)           │
└──────────────────────────────┘          │ • razorpayPaymentId         │
                                          └─────────────────────────────┘
```

---

## 6. Core Engineering Decisions & Application Logic

### 1. Server-Authoritative Cutoff Enforcement (BR-4)
- **The Pitfall:** Validating meal cancellation deadlines on the client device allows users to bypass rules by altering device clocks or submitting recorded API packets.
- **Engineering Solution:** All cutoff checks are calculated strictly on the backend (`services/cutoff.service.js`) against `Asia/Kolkata` server time:
  $$\text{Deadline} = \text{Date}(\text{Meal}) \text{ at } 17:00 \text{ IST}$$
- **Concurrency & Race Condition Defense:** Uses atomic MongoDB state transitions:
  ```js
  const updatedMeal = await MealInstance.findOneAndUpdate(
    { _id: mealId, customerId: userId, status: 'scheduled' },
    { status: 'skipped', skipReason: 'user' },
    { new: true }
  );
  if (!updatedMeal) {
    throw ApiError.conflict('Meal cannot be skipped. Either cutoff passed or already processed.');
  }
  ```
  If two concurrent tabs attempt to skip simultaneously, only one transaction matches `status: 'scheduled'`; the second returns an explicit `409 CONFLICT`.

### 2. Materialized MealInstances vs. Runtime Formulas (BR-3)
- **The Pitfall:** Calculating daily meal schedules, pause ranges, and skip credits on the fly using recurrence rules creates $O(N)$ recursive loops that break when providers change weekly menu prices.
- **Engineering Solution:** Subscriptions materialize concrete `MealInstance` records over a rolling 7-day horizon. Daily kitchen headcount aggregation and delivery routes become indexed database lookups ($O(1)$ query complexity).

### 3. Derived Mathematical Billing (BR-11)
- **The Pitfall:** Storing mutable running balances (`user.walletBalance = balance - 100`) leads to ledger corruption when past meals are edited or delivery disputes are arbitrated.
- **Engineering Solution:** Thalify derives balances dynamically from immutable meal state snapshots:
  $$\text{Charged} = \sum \text{Price}(\text{Delivered}) + \sum \text{Price}(\text{Failed with } \text{customer\_unavailable})$$
  $$\text{Credits} = \sum \text{Price}(\text{Skipped}) + \sum \text{Price}(\text{Cancelled}) + \sum \text{Price}(\text{Failed with } \text{provider\_fault})$$
  $$\text{Balance} = \max(0, \text{Charged} - \text{Paid})$$
  This guarantees zero financial drift and an auditable ledger.

### 4. Snapshotted Pricing (BR-14)
- When a `MealInstance` is generated, it captures `plan.pricePerMeal` into `mealInstance.price`. Future price updates by the kitchen never retroactively alter past bills.

### 5. Dual-Engine Persistence Resilience
- In the event that cloud network IP whitelisting restricts MongoDB Atlas, the backend automatically boots a high-performance local MongoDB memory engine and seeds all 8 kitchens, rotating menus, and accounts so the application **never crashes or blocks users**.

---

## 7. Edge Cases & Failure Handling Matrix

| Real-World Edge Case | Potential Point of Failure | Thalify Architectural Defense | Result Code |
| :--- | :--- | :--- | :--- |
| **Late Skip Attempt** | Customer tries to skip dinner at 6:30 PM after groceries are bought. | Server evaluates `Asia/Kolkata` time against 5:00 PM cutoff deadline. | `409 CUTOFF_PASSED` |
| **Simultaneous Double-Skip** | User double-clicks or triggers requests from two devices simultaneously. | Atomic MongoDB `findOneAndUpdate` filtering `{ status: 'scheduled' }`. | `409 INVALID_STATE` |
| **Tampering with Finalized Drop** | Rider attempts to re-mark a delivered drop as failed later. | Terminal state lock prevents mutation once marked delivered or failed. | `409 ALREADY_FINALIZED` |
| **Unauthorized Rider Mutation** | Delivery staff tries to update a drop assigned to another rider. | Resource ownership validation enforces `task.assignedTo === user._id`. | `403 FORBIDDEN` |
| **Subscribing in the Past** | User submits a past date for subscription start. | Validation middleware checks `startDate >= getTodayIST()`. | `400 VALIDATION_ERROR` |
| **Duplicate Overlapping Subscriptions**| User creates two active subscriptions to the same meal slot. | Unique constraint check checks overlapping date ranges. | `409 DUPLICATE_SUBSCRIPTION` |
| **Accidental Overpayment** | Customer initiates payment larger than current unpaid balance. | Pre-order calculation verifies `amount <= currentBill.balance`. | `409 OVERPAYMENT` |
| **Atlas Network IP Block** | Cloud Atlas restricts IP address changes. | Resilient Dual-Engine boots local Mongo and auto-seeds ecosystem. | Zero downtime fallback |

---

## 8. Role-Based Access Control (RBAC) & API Specification

| HTTP Method | Route Endpoint | Access Level | Description & Core Logic |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register customer or kitchen provider (delivery role blocked) |
| `POST` | `/api/auth/login` | Public | Authenticate user, issue signed JWT token with role claims |
| `GET` | `/api/providers` | Public | List verified neighborhood kitchens with area and cuisine filters |
| `GET` | `/api/providers/:id` | Public | Get kitchen profile, active meal plans, and 7-day revolving menu |
| `POST` | `/api/subscriptions` | Customer | Create recurring subscription, materialize rolling `MealInstance` records |
| `GET` | `/api/subscriptions/mine`| Customer | Retrieve customer's active and historical meal subscriptions |
| `PATCH`| `/api/meals/:id/skip` | Customer (Owner) | Cancel upcoming meal before 5:00 PM IST; credit user account |
| `PATCH`| `/api/meals/:id/undo-skip` | Customer (Owner) | Restore skipped meal back to scheduled before 5:00 PM IST cutoff |
| `POST` | `/api/billing/razorpay/order` | Customer | Create verified Razorpay order with overpayment balance guard |
| `POST` | `/api/billing/razorpay/verify`| Customer | Cryptographically verify signature, log receipt, update ledger |
| `GET` | `/api/provider/prep` | Provider (Owner)| Real-time kitchen headcount aggregation grouped by diet and slot |
| `GET` | `/api/provider/delivery/today` | Provider (Owner)| Retrieve today's delivery tasks clustered by neighborhood sector |
| `POST` | `/api/provider/delivery/generate` | Provider (Owner)| Idempotently generate delivery tasks for today's active drops |
| `PATCH`| `/api/delivery/tasks/:id` | Delivery Rider | Update drop status (`delivered` vs `failed`) with terminal lock |

---

## 9. Project Directory Structure

```
Thalify/
├── client/                        # Frontend Single-Page Application (React 18 + Vite)
│   ├── src/
│   │   ├── api/                   # Axios client with JWT interceptors
│   │   ├── components/            # Reusable UI (Navbar, Modal, Loader, Thali3DShowcase)
│   │   ├── context/               # AuthContext (RBAC) & SocketContext (WebSockets)
│   │   ├── pages/
│   │   │   ├── auth/              # Production Sign In & Register views
│   │   │   ├── customer/          # Browse Kitchens, Provider Detail, Meal Calendar, Billing
│   │   │   ├── provider/          # Kitchen Operations Dashboard, Prep Engine, Dispatch, Menu
│   │   │   └── delivery/          # Mobile Rider Drop Board
│   │   ├── App.jsx                # React Router v6 routing hierarchy
│   │   └── index.css              # Tailwind CSS configuration with smooth scroll
│   └── package.json
│
├── server/                        # Backend REST & WebSocket Gateway (Node.js + Express ESM)
│   ├── src/
│   │   ├── config/                # Environment config & Dual-Engine database connector
│   │   ├── controllers/           # Lightweight HTTP request orchestrators
│   │   ├── middleware/            # JWT authentication, role guards (RBAC), error handler
│   │   ├── models/                # Mongoose schemas (User, Provider, Plan, MealInstance, etc.)
│   │   ├── routes/                # Route definitions mapped by resource domain
│   │   ├── seed/                  # Seeding helper for 8 kitchens, menus, and accounts
│   │   ├── services/              # Pure business logic (Cutoff, Billing, Prep, Delivery)
│   │   ├── sockets/               # Real-time WebSocket pub/sub event emitters
│   │   └── server.js              # HTTP server & cron scheduler entry point
│   ├── tests/
│   │   └── acceptance.test.js     # Comprehensive automated acceptance test suite
│   └── package.json
│
├── DEMO_SCRIPT.md                 # Verbatim 3–5 minute video demonstration script
└── README.md                      # Complete system documentation
```

---

## 10. Local Setup & Quick Start

### Prerequisites
- Node.js >= v18.0.0
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/jay-0804/Thalify.git
cd Thalify
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

**Server Configuration (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.buk9m1n.mongodb.net/tiffinloop?retryWrites=true&w=majority
JWT_SECRET=tiffinloop_secret_dev_key_super_secure_12345
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TZ=Asia/Kolkata
RAZORPAY_KEY_ID=rzp_test_Tn4RkYZcNIkpN6
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Client Configuration (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application
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

## 11. Automated Acceptance Test Suite (18/18 Passing)

Thalify includes an automated acceptance test suite in `server/tests/acceptance.test.js`:

```bash
cd server
npm test
```

### Verified Test Cases:
1. `AUTH-01`: Public registration restricts role escalation to delivery staff (`400 VALIDATION_ERROR`)
2. `AUTH-02`: Duplicate email registration returns `409 EMAIL_EXISTS`
3. `SUB-01`: Cross-user subscription access returns `403 FORBIDDEN`
4. `SUB-02`: Past start dates for subscriptions return `400 VALIDATION_ERROR`
5. `SUB-03`: Overlapping active subscriptions to the same plan return `409 DUPLICATE_SUBSCRIPTION`
6. `MEAL-01`: Subscribing materializes meal instances matching plan days
7. `MEAL-02`: Generation is strictly idempotent with zero duplicates
8. `SKIP-01`: Skipping before cutoff (5:00 PM IST) reduces prep headcount and credits ledger
9. `SKIP-02`: Skipping after cutoff returns `409 CUTOFF_PASSED` with deadline details
10. `SKIP-03`: Skipping an already delivered meal returns `409 INVALID_STATE`
11. `PAUSE-01`: Pausing skips unlocked meals and safely reports locked ones
12. `PAUSE-02`: Resuming restores pause-skipped meals to scheduled
13. `PREP-01`: Kitchen prep aggregation accurately groups by diet and slot
14. `DELIV-01`: Delivery partner cannot update an unassigned task (`403 FORBIDDEN`)
15. `DELIV-02`: Failure with `customer_unavailable` is billable; `provider_fault` is credited
16. `BILL-01`: Monthly bill math matches itemized line items exactly
17. `BILL-02`: Overpayment returns `409 OVERPAYMENT`
18. `PAY-01`: Razorpay order generation and verification updates balance accurately
