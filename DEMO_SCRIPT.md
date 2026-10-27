# Thalify — Complete Line-by-Line Demo Video Script
**Target Duration:** 3:30 – 4:30 minutes  
**Format:** Read the **[SAY]** text aloud naturally while performing the corresponding **[ACTION]** on your screen.

---

## 🛠️ Pre-Recording Setup (1 Minute Prep)
1. Open **Browser Window 1** at `http://localhost:5173` (Zoom at 100% or 110%).
2. Open **Browser Window 2** (or Incognito / second tab) ready for the Provider Dashboard.
3. Open a **Terminal window** ready inside `server/` with `npm test` ready to press Enter.
4. Set microphone volume comfortably.

---

## ⏱️ Video Walkthrough

---

### [0:00 – 0:45] SCENE 1: THE REAL-WORLD PROBLEM & INTRODUCING THALIFY

**[ACTION]:**
> Start with your screen full on `http://localhost:5173`.  
> Move your cursor over the interactive 3D brass thali on the right so the bowls and brass shimmer under the light.  
> Slowly scroll down to show the stats bar (100% Skip Credits, 17:00 IST Cutoff, ₹0 Drift Ledger).

**[SAY]:**
> "Hello everyone! My name is Jay Baid, and this is the demonstration of **Thalify**—our end-term software engineering project with the tagline: *'Your daily meals, on your terms.'*
>
> In India today, over 15 million college students, PG residents, and working professionals depend on daily tiffin services and PG messes for their lunch and dinner.
>
> But almost this entire multi-crore industry runs on manual paper diaries, phone calls, and chaotic WhatsApp messages. 
>
> Picture this common scenario: a student goes out for dinner with friends at 8 PM and sends a WhatsApp text: *'Bhaiya, kal tiffin mat bhejna.'* The mess owner is busy cooking, misses the message, and prepares the food anyway. 
>
> At the end of the month, the student claims they skipped eight meals, while the kitchen owner's notebook only has three tally marks. This leads to bitter arguments, lost revenue for the kitchen, and massive food wastage.
>
> We built Thalify to solve this problem permanently through **server-authoritative 5:00 PM cutoff enforcement**, **mathematically derived billing**, **real-time WebSocket kitchen orchestration**, and **integrated Razorpay payments**."

---

### [0:45 – 1:35] SCENE 2: CUSTOMER CALENDAR & 5:00 PM SKIP / UNDO ENGINE

**[ACTION]:**
> Click **"Sign In"** in the top navigation bar.  
> Click the **"Quick Demo Accounts"** button to reveal the 1-click credential drawer.  
> Click **"Rohan Sharma (Customer)"**—it auto-fills and logs you in directly.  
> Click **"Subscriptions"** in the navbar, and click on Rohan's active subscription card to open the **14-Day Interactive Meal Calendar**.  
> Point your cursor to the daily dishes listed on today's card (*Paneer Butter Masala • Yellow Dal Tadka • Desi Ghee Phulkas*).  
> Click the **"Skip Meal"** button on tomorrow's lunch. Show the badge turning to a red "Skipped" badge.  
> Point to the **"Undo Skip"** button that immediately appears. Click **"Undo Skip"** to restore it back to "Scheduled".

**[SAY]:**
> "Let's log in as our customer persona, Rohan Sharma, using our 1-click test credential drawer. Notice that our application uses strict Role-Based Access Control.
>
> Inside the Customer Portal, Rohan can access his active 30-day subscription and a transparent 14-day rolling meal calendar. 
>
> Notice that every day's card explicitly lists the freshly cooked menu dishes for that day—such as Paneer Butter Masala, Yellow Dal Tadka, and Desi Ghee Phulkas.
>
> Now, here is where our core engineering logic comes in:
>
> If Rohan is heading out, he doesn't need to call anyone or send a WhatsApp text. He simply clicks 'Skip Meal'. The system instantly marks the meal as skipped, adjusts tomorrow's cooking count, and credits the cost directly back to his account.
>
> What if his plans change? He has an 'Undo Skip' button right here. 
>
> But here is the critical business rule: this skip and undo functionality is strictly governed by a server-side cutoff at **5:00 PM IST**. After 5:00 PM, the server permanently locks the meal with a 409 error code. This protects the kitchen from late-night cancellations and ensures they can purchase exact grocery quantities without wasting food."

---

### [1:35 – 2:20] SCENE 3: DERIVED BILLING LEDGER & RAZORPAY PAYMENT

**[ACTION]:**
> Scroll down to the **"Monthly Billing & Itemized Ledger"** section on the same page.  
> Hover over the summary boxes: Total Charged, Credits Saved, Amount Paid, and Remaining Balance.  
> Click the green **"Pay Balance with Razorpay"** button.  
> In the Razorpay payment modal, point out the amount, click **"Confirm & Pay"**.  
> Watch the modal close, the success toast appear, the balance update immediately, and a new payment receipt appear in the ledger.

**[SAY]:**
> "Scrolling down, we arrive at our **Derived Billing Ledger**.
>
> In many naive applications, user wallet balances are stored as mutable numbers that easily drift out of sync. In Thalify, the balance is derived mathematically directly from immutable meal instance records. Delivered meals are charged, while customer-skipped meals are credited.
>
> Here, Rohan can see the exact amount charged, the savings credited from skipped meals, and his remaining unpaid balance.
>
> To settle the balance, he simply clicks 'Pay Balance with Razorpay'. Our backend creates an authentic Razorpay order. When we confirm the payment, our server cryptographically verifies the transaction, credits the ledger, and generates an auditable digital receipt. No more month-end fights—every single rupee is accounted for."

---

### [2:20 – 3:15] SCENE 4: KITCHEN OWNER PORTAL, PREP ENGINE & REAL-TIME ALERTS

**[ACTION]:**
> Switch to the second browser tab or log out and log in as **"Sunita Sharma (Maa Ki Rasoi)"** (`provider@demo.com`).  
> Point out the top metrics: Tomorrow's Headcount, Today's Drops, and Total Unpaid Balance.  
> Point out the **"Live Customer Skip Feed"** on the right side of the screen.  
> Click on the **"Prep Sheet & KOT"** tab.  
> Show the aggregated counts: Veg Lunch, Non-Veg Lunch, Rotis, Dal portions.  
> Click the **"Print Kitchen Order Ticket (KOT)"** button to show the clean print-ready ticket.  
> Open the **"Customer Directory"** tab to show active subscribers with the 1-click **"WhatsApp"** button.

**[SAY]:**
> "Now let's switch perspectives to the Kitchen Owner Portal for 'Maa Ki Rasoi'.
>
> Here, the kitchen manager has total operational control. Look at the right panel: whenever a customer skips a meal, a live WebSocket event pushes a real-time notification directly to this feed without needing a page refresh.
>
> Next is our **Automated Kitchen Prep Engine**. 
>
> In traditional messes, cooks waste hours doing manual tally marks. In Thalify, our engine automatically aggregates tomorrow's exact cooking requirements broken down by diet—Veg versus Non-Veg—and meal slot. With one click, the chef can print a standard Kitchen Order Ticket (KOT) for the cooks.
>
> We have also included a Customer Directory where the kitchen can view all active subscribers, broadcast announcements, and message customers directly on WhatsApp with a single click."

---

### [3:15 – 3:55] SCENE 5: DELIVERY ROUTE DISPATCH & STATUS LOCKING

**[ACTION]:**
> Click on the **"Delivery Dispatch"** tab.  
> Show today's delivery tasks grouped by sector: Koramangala, HSR Layout, BTM.  
> Point out the status badges ("Pending", "Delivered", "Failed").  
> Click **"Delivered"** on a pending drop. Show the status turn green and lock.  
> Click **"Failed"** on another drop to show the reason selector modal (`customer_unavailable` vs. `kitchen_fault`).

**[SAY]:**
> "Now let's examine the logistics workflow in the **Delivery Dispatch Board**.
>
> Daily drops are automatically clustered by neighborhood sectors—like Koramangala and HSR Layout—making route distribution effortless for delivery riders.
>
> Riders have a clean, mobile-optimized checklist where they can mark each meal as 'Delivered' or 'Failed'. 
>
> If a delivery fails, the rider must select an audited reason code: if the customer was unavailable, the meal remains billable; if the kitchen was at fault, the customer is automatically credited.
>
> Once marked, our backend state machine permanently locks the task, preventing accidental double-drops or post-delivery tampering."

---

### [3:55 – 4:30] SCENE 6: ARCHITECTURE, TEST SUITE & CONCLUSION

**[ACTION]:**
> Switch to your Terminal window.  
> Run the command: `npm test` inside the `server/` directory.  
> Show the terminal output running all 18 acceptance tests and showing **18 passing (100% green checkmarks)**.  
> Switch back to the Thalify landing page.

**[SAY]:**
> "Under the hood, Thalify is built on a modern, decoupled architecture: React 18 with Tailwind CSS on the frontend, an Express ES-module API gateway with Socket.io WebSockets, and MongoDB Atlas with compound unique indexes to guarantee strict idempotency.
>
> As you can see on the screen, our entire application is backed by an automated acceptance test suite covering all 18 core business rules—including concurrency locks, cutoff enforcement, overpayment guards, and role security—all passing with a 100% success rate.
>
> Thalify replaces messy paper notebooks with a reliable, transparent, and waste-free subscription platform for everyone.
>
> Thank you very much!"

---

## 💡 Quick Tips for High Marks
1. **Pronunciation**: Speak steadily and pause for 1 second after each action before speaking.
2. **Cursor Motion**: Move your cursor smoothly to guide the evaluator's eye.
3. **No Code Reading**: As per the guidelines, showing the working product and its workflows carries the highest weightage (80%+).
