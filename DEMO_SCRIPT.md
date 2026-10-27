# Thalify — 3 to 5 Minute Demo Video Script
**Target Duration:** 3:30 – 4:30 minutes  
**Tone:** Confident, professional, clear, engineering-oriented  
**Product:** Thalify — *“Your daily meals, on your terms.”*

---

## 🎬 Video Recording Checklist (Before Hitting Record)
1. **Frontend running** on `http://localhost:5173` (Zoom set to 100% or 110% for crisp text).
2. **Backend running** on `http://localhost:5000`.
3. Open two browser windows side-by-side or tabs ready:
   - **Tab 1:** Customer View (`customer@demo.com`)
   - **Tab 2:** Kitchen Owner Dashboard (`provider@demo.com`)
4. Microphone tested and clear.

---

## ⏱️ Video Script Breakdown

### [0:00 – 0:40] Scene 1: Introduction & The Core Problem
**Visual / Screen Action:**
> Start on the **Landing Page** of Thalify (`http://localhost:5173`).
> Slowly scroll down to reveal the interactive 3D brass thali showcase, the value proposition cards, and the 8 curated kitchens across Bengaluru.

**Spoken Voiceover:**
> *"Hello everyone! Welcome to the demonstration of **Thalify**, an end-term software engineering project designed to revolutionize how daily meal subscriptions, PG messes, and home kitchens operate.*
>
> *Across urban hubs, millions of students and working professionals rely on daily tiffin deliveries. Yet virtually the entire sector runs on chaotic WhatsApp messages, phone calls, and manual notebook tallies.*
>
> *This creates three massive headaches: first, late-night meal skips causing disputes over monthly bills; second, kitchens overcooking food because they don't know tomorrow's exact headcount; and third, delivery miscommunication with zero proof of drops.*
>
> *Thalify solves this through **server-authoritative 5:00 PM cutoff enforcement**, **mathematically derived billing**, **real-time WebSocket kitchen dispatch**, and **integrated Razorpay payments**."*

---

### [0:40 – 1:30] Scene 2: Role-Based Access & Customer Meal Calendar
**Visual / Screen Action:**
> Click **"Login"** in the top navigation.
> Click the **"Quick Demo Accounts"** button to show the 1-click credential selector with all 8 kitchens and customer accounts.
> Select **"Rohan Sharma (Customer)"** and click Login.
> Go to **"Subscriptions"** and open the active subscription to show the **14-Day Interactive Meal Calendar**.
> Point your cursor to the daily dishes shown inside the calendar card (*Paneer Butter Masala • Yellow Dal Tadka • Desi Ghee Phulkas*).

**Spoken Voiceover:**
> *"Let's log in as our customer persona, Rohan Sharma. Notice our streamlined credential drawer that provides 1-click access across all user roles with strict Role-Based Access Control.*
>
> *Inside the Customer Portal, Rohan can see his active 30-day subscription and a transparent 14-day rolling meal calendar. Unlike static apps, every day's card details the exact dishes being prepared.*
>
> *Now watch what happens when Rohan needs to skip a meal. Before the kitchen's 5:00 PM IST cutoff, he simply clicks 'Skip Meal'. The system instantly transitions the meal to 'Skipped', credits his account balance, and prevents food waste before groceries are purchased.*
>
> *And if his plans change? He has an 'Undo Skip' option available right up until 5:00 PM. But if he tries to skip or undo after 5:00 PM, the server strictly blocks the request with an immutable cutoff lock—guaranteeing fairness for the kitchen."*

---

### [1:30 – 2:20] Scene 3: Derived Ledger & Razorpay Checkout
**Visual / Screen Action:**
> Scroll down to the **Monthly Billing & Ledger** card on the subscription page.
> Highlight the real-time breakdown: Gross Amount, Skipped Credits Saved, Amount Paid, and Remaining Balance.
> Click the **"Pay Balance with Razorpay"** button.
> The payment modal opens showing the amount and Razorpay test checkout integration. Click **"Confirm & Pay"**.
> Show the green success toast, instant ledger update, and newly recorded receipt.

**Spoken Voiceover:**
> *"Next is our Derived Billing Ledger. In Thalify, balances are never stored as mutable numbers that can get out of sync. Instead, the balance is derived directly from immutable meal instance states—delivered meals are charged, while customer skips are credited.*
>
> *Rohan can immediately settle his monthly balance using our integrated **Razorpay Payment Gateway**. When he initiates a payment, our backend issues a verified Razorpay order. Upon confirmation, the payment is cryptographically verified, the ledger updates in real time, and an auditable receipt is stored in MongoDB."*

---

### [2:20 – 3:15] Scene 4: Kitchen Owner Dashboard & Real-Time Prep Engine
**Visual / Screen Action:**
> Switch to the Kitchen Owner tab (`provider@demo.com` — *Maa Ki Rasoi*).
> Show the **Live Operations Dashboard**: Tomorrow's Cook Headcount, Today's Drop Progress, and Active Subscribers.
> Point out the **Live Customer Skip Notification Feed** on the right side.
> Open the **"Prep Sheet & KOT"** tab to show automated aggregation by Diet (Veg vs Non-Veg) and Meal Slot (Lunch vs Dinner).
> Click **"Print Kitchen Order Ticket (KOT)"** to show the clean print preview.
> Open the **Customer Directory** to show the list of subscribers with 1-click WhatsApp messaging.

**Spoken Voiceover:**
> *"Now let's switch to the Kitchen Owner Portal for 'Maa Ki Rasoi'.*
>
> *Here, the kitchen manager has complete operational visibility. Whenever any subscriber skips a meal, a live WebSocket event triggers an instantaneous notification on the dashboard without needing to refresh the page.*
>
> *The core innovation here is our **Automated Prep Engine**. Instead of manual tallying, Thalify aggregates tomorrow's guaranteed headcount categorized by diet—Veg versus Non-Veg—and route sector. With one click, the chef can print a standard Kitchen Order Ticket (KOT) for the cooks.*
>
> *Furthermore, the provider has an instant customer directory with one-click direct WhatsApp integration and broadcast announcement capabilities to keep subscribers informed."*

---

### [3:15 – 3:55] Scene 5: Delivery Dispatch Board & Status Locking
**Visual / Screen Action:**
> Navigate to the **"Delivery Dispatch"** tab in the kitchen dashboard.
> Show today's drop list categorized by area (Koramangala, HSR Layout).
> If empty, click **"Generate Today's Demo Drops"** to show instant task generation.
> Log in as the Delivery Rider (`delivery@demo.com`) or show the dispatch board marking a drop as **"Delivered"**.
> Highlight how terminal states lock the drop permanently to prevent tampering (`409 ALREADY_FINALIZED`).

**Spoken Voiceover:**
> *"On the logistics side, our Delivery Dispatch board groups daily drops by geographic area and assigns them to delivery riders.*
>
> *Riders access a streamlined mobile view where they can mark each drop as 'Delivered' or 'Failed'. If a drop fails, the rider must specify the reason—for example, 'customer unavailable', which is billable, versus 'kitchen fault', which is credited back to the customer.*
>
> *Once a drop is marked, our state machine locks the record permanently, providing an indisputable audit trail."*

---

### [3:55 – 4:30] Scene 6: Architecture, Testing & Conclusion
**Visual / Screen Action:**
> Switch briefly to a terminal or VS Code window.
> Run `npm test` inside `server/` to show all **18/18 Acceptance Tests passing with 100% green checkmarks**.
> Switch back to the Thalify landing page.

**Spoken Voiceover:**
> *"Under the hood, Thalify is built on a resilient modern architecture: React 18 and Tailwind on the frontend, an Express ES-module REST API with Socket.io real-time websockets, and MongoDB with compound unique indexes for strict idempotency.*
>
> *Our codebase is verified by an automated acceptance test suite covering all 18 core business rules—including concurrency locks, cutoff validation, overpayment prevention, and role authorization—all passing with a 100% success rate.*
>
> *Thalify transforms informal tiffin services into an organized, transparent, and waste-free subscription economy.*
>
> *Thank you for watching!"*

---

## 💡 Quick Tips for High Marks
- **Speak clearly and at a steady pace.**
- **Keep cursor movements deliberate and smooth.**
- **Show the working UI rather than reading code files.**
- **Mention the 5:00 PM IST cutoff and derived billing** — evaluators look specifically for meaningful application logic over simple CRUD!
