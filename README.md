# 👗 Dress Rental Platform (SaaS MVP)

**Developed by:** [Pascal Solutions TI](https://www.pascalsolutionsti.com)
**Status:** Production (v1.0-LTS)

## 📖 Overview
A comprehensive web-based platform designed to digitize the operations of luxury dress rental businesses. This solution transforms a traditional brick-and-mortar inventory into a 24/7 digital branch with automated booking logic.

Unlike standard e-commerce sites, this platform handles the complexity of **temporal inventory** (date-based availability), preventing double-booking conflicts automatically.

## 🚀 Key Features

### 👤 For Customers (Public View)
* **Dynamic Filtering:** Real-time SQL filtering by Size, Color, Price, and Tags.
* **Smart Availability:** Interactive calendar blocking dates based on existing reservations.
* **Responsive Design:** Mobile-first UX built with Tailwind CSS and Shadcn/UI.

### 🛡️ For Administrators (Business Logic)
* **Inline CMS:** Edit prices, descriptions, and statuses directly on the UI (No-code experience).
* **Inventory Management:** Full CRUD operations for dresses with image optimization.
* **Booking Conflict Engine:** Backend logic that calculates date overlaps to prevent errors.
* **Secure Access:** Role-based access control (RBAC) via Supabase Auth.

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), React, TypeScript.
* **Styling:** Tailwind CSS, Shadcn/UI (Radix Primitives).
* **Backend:** Serverless Functions (Next.js API Routes).
* **Database:** Supabase (PostgreSQL) + Row Level Security (RLS).
* **Storage:** Supabase Storage (Image Buckets).
* **Infrastructure:** Vercel Edge Network / Docker (Ready for AWS migration).

## 🧩 Architecture Highlights

### The "Date-Blocking" Logic
One of the core engineering challenges solved in this project is the availability check. We implemented a relational model (`bookings` table) and an overlap algorithm:

```sql
-- Logic to detect conflicts
SELECT * FROM bookings
WHERE dress_id = target_dress
AND (start_date <= requested_end AND end_date >= requested_start)
