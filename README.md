<div align="center">

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />

<br/>

# 🎫 BookIT

### ⚡ A High-Concurrency Ticket Booking System ⚡

**Zero double-bookings. Zero downtime. Zero chill during flash sales.**

<p>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=flat-square" alt="Made with love" />
</p>

</div>

---

## 📖 About The Project

**BookIT** is a robust, production-grade event ticketing platform engineered to survive massive traffic spikes without ever double-booking a seat. Whether it's a sold-out concert or a viral conference, BookIT gracefully handles the chaos — automatically queuing users via a **FIFO waitlist**, releasing abandoned holds in real time, and giving organisers dynamic analytics to track it all.

> Built for the moment 10,000 people click "Buy" on the same seat at the same millisecond. ⏱️

---

## ✨ Key Features

| 🚀 Feature | 💬 Description |
| :--- | :--- |
| 🔒 **Race-Condition-Proof Booking** | Atomic `updateMany` operations guarantee only one user ever wins a seat |
| ⏳ **Smart Seat Holds** | 10-minute TTL holds prevent cart-hoarding without hurting real buyers |
| 📋 **Automated Waitlist** | FIFO queue automatically offers freed-up seats to the next in line |
| 📧 **Transactional Emails** | Nodemailer-powered checkout links sent the moment a seat opens up |
| 🛡️ **Role-Based Access Control** | Clean separation between `ADMIN`, `ORGANISER`, and `CUSTOMER` |
| 📊 **Organiser Analytics** | Real-time insight into event performance and sales |

---

## 🧰 Tech Stack

<div align="center">

| Layer | Technology |
| :---: | :---: |
| **Frontend** | React + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (via Prisma ORM) |
| **Auth** | JWT |
| **Emails** | Nodemailer |
| **Scheduling** | Node.js Cron Jobs |

</div>

---

## 📑 Table of Contents

- [🚀 Quick Start Guide](#-quick-start-guide-for-new-computers)
- [⚙️ Environment Variables](#️-environment-variables)
- [📡 API Documentation](#-api-documentation)
- [🗄️ Database Schema](#️-database-schema)
- [🧠 System Design & Architecture](#-system-design--architecture)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🚀 Quick Start Guide (For New Computers)

Follow these steps exactly to get BookIT running locally.

### 1️⃣ Prerequisites

Make sure you have installed:

- 🟢 [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- 🍃 [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017`, or an Atlas cluster)
- 🐙 [Git](https://git-scm.com/downloads)

### 2️⃣ Clone the Repository

```bash
git clone <your-github-repo-url>
cd ticket_booking_system
```

### 3️⃣ Setup the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create the environment variables file
cp .env.example .env
# Open the .env file and update the Database URL and Email settings

# 3. Generate Prisma ORM Client
npx prisma generate

# 4. Seed the database (creates initial Roles, Admin, and Venues)
node seed_mongo.js

# 5. Start the backend server
npm run dev
```

### 4️⃣ Setup the Frontend

Open a **new** terminal window and navigate to the frontend directory:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the React development server
npm run dev
```

<div align="center">

### 🎉 Success! Open your browser and go to `http://localhost:5174`

</div>

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend` folder using the template below:

```env
# Server Port
PORT=3000

# MongoDB Database Connection
DATABASE_URL="mongodb://127.0.0.1:27017/ticket_booking"

# JWT Authentication Security
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRATION="86400000" # 24 hours in ms

# Email Configuration for Automated Notifications (Nodemailer)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
```

> 🔐 **Security tip:** Never commit your real `.env` file. Keep secrets out of version control.

---

## 📡 API Documentation

<details>
<summary><strong>🔐 Auth Routes</strong></summary>
<br/>

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/auth/register` | Register as `CUSTOMER`, `ORGANISER`, or `ADMIN` |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |

</details>

<details>
<summary><strong>🏢 Events & Venues Routes</strong></summary>
<br/>

| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/events` | Public list of events | Public |
| `POST` | `/api/events` | Create an event | Organiser |
| `POST` | `/api/venues` | Create a venue | Admin |

</details>

<details>
<summary><strong>🎫 Booking & Seats Routes</strong></summary>
<br/>

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/seats/hold` | Hold seats temporarily before payment |
| `POST` | `/api/bookings` | Confirm booking (requires held seats) |
| `DELETE` | `/api/bookings/:id/cancel` | Cancel a booking and release seats |

</details>

<details>
<summary><strong>⏳ Waitlist & Support Routes</strong></summary>
<br/>

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/waitlists` | Join the waitlist for a specific event category |
| `POST` | `/api/support/query` | Submit a help center query |

</details>

---

## 🗄️ Database Schema

BookIT relies on a flexible MongoDB structure via the Prisma ORM.

| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| 👤 **Users** | Core account system | `id`, `email`, `role_id`, `password` |
| 🛡️ **Roles** | RBAC permissions | `id`, `name` *(ADMIN, ORGANISER, CUSTOMER)* |
| 🏟️ **Venues** | Physical locations | `id`, `name`, `capacity`, `address` |
| 🎭 **Events** | Scheduled shows | `id`, `title`, `venue_id`, `prices` |
| 🧾 **Bookings** | User transactions | `id`, `user_id`, `status`, `expires_at` |
| ⏳ **Waitlist** | Queue for sold-out events | `id`, `user_id`, `event_id`, `status` |

---

## 🧠 System Design & Architecture

The architecture of BookIT strictly prioritizes **data integrity** during high-concurrency flash sales, ensuring users *never* experience double-booking or system lock-ups.

### 🛡️ Concurrency Prevention

During popular events, thousands of users might attempt to click the same seat simultaneously. Instead of a vulnerable `SELECT then UPDATE` workflow, BookIT implements **Optimistic Concurrency Control** directly at the database driver level.

```
User clicks seat
      │
      ▼
Atomic updateMany({ status: 'AVAILABLE' } → { status: 'HELD' })
      │
      ├── modifiedCount = 1  →  ✅ Seat locked, booking created
      │
      └── modifiedCount = 0  →  ❌ "Locked by another user"
```

Because MongoDB processes the update atomically, **only the very first request** succeeds — every other concurrent request fails the condition instantly and receives a graceful error on the frontend.

### ⏱️ Seat Hold & TTL Mechanism

To stop malicious users from locking up an entire venue without paying:

- ✅ A successful hold creates a `Booking` with status `HELD`
- ⏰ An `expires_at` timestamp is set **10 minutes** into the future
- 💳 If payment completes → status becomes `CONFIRMED`
- 🔄 If the timer runs out → the background worker releases the seat

### 🔄 Waitlist Auto-Assignment Flow

Once a ticket category sells out, customers can hit **"Join Waitlist"** on the Event Details page. The waitlist runs as a strict **First-In-First-Out (FIFO)** queue, storing each entry with a `WAITING` status.

### ⏳ Time-Limited Offer Handling

A background **Node.js cron scheduler** runs every 5 minutes, bridging expired holds and the waitlist queue:

| Step | Action |
| :---: | :--- |
| 1️⃣ **Sweeping** | Finds `HELD` bookings past `expires_at`, marks them `EXPIRED`, releases seats to `AVAILABLE` |
| 2️⃣ **Matching** | Scans the waitlist for a match against newly freed seats |
| 3️⃣ **Offer Generation** | Creates a new `HELD` booking with an extended **24-hour** TTL and emails a secure checkout link |
| 4️⃣ **Resolution** | If the offer expires unused, the scheduler moves on to the next person in line |

<div align="center">

```
 Seat Expires  →  🧹 Sweep  →  🔍 Match Waitlist  →  📧 Email Offer  →  ⏳ 24h Window
                                                                              │
                                              ┌───────────────────────────────┘
                                              ▼
                                   Purchased ✅   or   Expired → Next in Queue 🔁
```

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. 🍴 Fork the project
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Made with ❤️ and a lot of ☕

</div>