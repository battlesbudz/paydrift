# PayDrift — Product Specification

## 1. Concept & Vision

PayDrift is a micro-SaaS that automates invoice chasing for freelancers and small agencies. You add a client, invoice them, and PayDrift sends humanized follow-ups at the right moments — friendly, firm, never robotic. It removes the awkwardness of chasing money so freelancers can focus on work, not guilt.

**Core feeling:** "I never have to feel weird about getting paid again."

---

## 2. Design Language

### Color Palette
- **Primary:** `#5B6AF0` (indigo)
- **Primary dark:** `#4655E8`
- **Accent:** `#22C55E` (green — money, success)
- **Background:** `#F8F7FF` (soft lavender-white)
- **Surface:** `#FFFFFF`
- **Text primary:** `#111827`
- **Text muted:** `#6B7280`
- **Danger:** `#EF4444`
- **Warning:** `#F59E0B`

### Typography
- **Headings:** Inter (700, 600)
- **Body:** Inter (400, 500)
- **Mono (invoice amounts):** JetBrains Mono

### Motion
- Micro-interactions: 150ms ease-out on buttons/inputs
- Page transitions: fade 200ms
- Loading states: subtle pulse animation
- Success moments: brief scale-up pop

---

## 3. Pricing

| Tier | Price | Description |
|---|---|---|
| **Free** | $0/mo | 1 client, 5 invoices/mo, 3 email reminders |
| **Pro** | $19/mo | Unlimited clients + invoices, unlimited reminders, analytics |
| **Agency** | $49/mo | 5 seats, white-label invoices, priority support |

Free trial: 14 days on Pro/Agency (no credit card required to start).

---

## 4. Tech Stack

### Backend (Railway)
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma (SQLite for dev, PostgreSQL on Railway)
- **Auth:** JWT (access + refresh tokens), email magic-link via Resend
- **Payments:** Stripe (checkout sessions, customer portal, webhooks)
- **Email:** Resend (transactional + drip sequences)
- **Scheduling:** node-cron jobs (UTC-based, runs every hour)

### Frontend (Vite + React + TypeScript)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** Zustand (lightweight)
- **HTTP:** Axios
- **Forms:** React Hook Form + Zod

### Infrastructure
- **Backend:** Railway (1 x Basic plan)
- **Database:** Railway PostgreSQL
- **Frontend:** Vercel (static hosting)
- **Email:** Resend (paydrift@paydrift.app domain verification)

---

## 5. Database Schema (Prisma)

```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  passwordHash   String?
  stripeCustomerId String?
  stripeSubscriptionId String?
  plan           String    @default("free") // free | pro | agency
  planEndsAt     DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  clients        Client[]
  emailLogs      EmailLog[]
}

model Client {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  name      String
  email     String
  company   String?
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  invoices  Invoice[]
}

model Invoice {
  id          String    @id @default(cuid())
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id])
  userId      String
  amount      Int       // cents
  currency    String    @default("USD")
  description String
  dueDate     DateTime
  status      String    @default("pending") // pending | paid | overdue | cancelled
  paidAt      DateTime?
  stripeInvoiceId String?
  remindersSent Int     @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  reminders   Reminder[]
}

model Reminder {
  id          String    @id @default(cuid())
  invoiceId   String
  invoice     Invoice   @relation(fields: [invoiceId], references: [id])
  scheduledFor DateTime
  sentAt      DateTime?
  emailLogId  String?
  createdAt   DateTime  @default(now())
}

model EmailLog {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  to        String
  subject   String
  body      String
  resendId  String?
  status    String    @default("pending") // pending | sent | failed
  sentAt    DateTime?
  createdAt DateTime  @default(now())
}
```

---

## 6. API Routes

### Auth
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — magic link via email
- `GET /api/auth/verify?token=` — verify magic link, return JWT
- `GET /api/auth/me` — get current user
- `POST /api/auth/logout` — invalidate refresh token

### Clients
- `GET /api/clients` — list all (filter by user)
- `POST /api/clients` — create
- `GET /api/clients/:id` — get one
- `PUT /api/clients/:id` — update
- `DELETE /api/clients/:id` — delete (cascades invoices)

### Invoices
- `GET /api/invoices` — list all (filter by client, status)
- `POST /api/invoices` — create
- `GET /api/invoices/:id` — get one
- `PUT /api/invoices/:id` — update (amount, due date, description)
- `DELETE /api/invoices/:id` — delete
- `POST /api/invoices/:id/mark-paid` — manually mark paid
- `POST /api/invoices/:id/send-now` — trigger immediate reminder

### Stripe
- `POST /api/stripe/create-checkout` — create Stripe Checkout session
- `POST /api/stripe/portal` — customer portal session
- `POST /api/stripe/webhook` — Stripe webhook handler

### Dashboard
- `GET /api/dashboard/stats` — total clients, invoices, overdue count, MRR

---

## 7. Email Reminder Sequences

Triggered by cron every hour. For each overdue invoice:

| Reminder | Timing | Tone |
|---|---|---|
| **Gentle nudge** | 1 day overdue | Friendly, no pressure |
| **Friendly reminder** | 5 days overdue | Slightly firmer |
| **Getting serious** | 10 days overdue | Professional, direct |
| **Final notice** | 15 days overdue | Firm, includes late fee mention |
| **Hand off** | 20 days overdue | "We recommend a different approach" |

Email templates are stored in DB (per-user customization supported).

---

## 8. Landing Page Structure

1. **Hero** — "Stop chasing. Start getting paid." + CTA (Start Free)
2. **Pain points** — 3 cards: "Hate sending awkward follow-ups?", "Wave sounds robotic", "Spreadsheets are a mess"
3. **How it works** — 3 steps: Add client → Send invoice → PayDrift chases
4. **Pricing** — 3 tiers with feature lists
5. **Social proof** — testimonials (3)
6. **FAQ** — 6 common questions
7. **CTA** — Final conversion

---

## 9. Onboarding Flow (Dashboard)

1. **Welcome** — "Add your first client" (name, email)
2. **Create invoice** — client pre-selected, enter amount/description/due date
3. **Connect Stripe** — optional, for paid plans
4. **You're live** — shows empty dashboard, ready to chase

Total steps to first reminder: ~2 minutes.

---

## 10. Security Requirements

- All API routes require valid JWT (except auth endpoints)
- Stripe webhook signature verification
- Rate limiting: 100 req/min per IP on auth routes
- CORS restricted to known origins
- No PII logged in plain text

---

## 11. Out of Scope (V1)

- Multi-currency (USD only in V1)
- Recurring/subscription invoices
- Team collaboration (Agency tier: 5 hard-coded seats)
- Mobile app
- White-label / custom domain
- API access for third-parties