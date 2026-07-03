<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  
  <h1>🎫 BookIT</h1>
  <p><strong>A High-Concurrency Ticket Booking System</strong></p>
</div>

---

BookIT is a robust, high-performance event ticketing platform engineered to handle massive traffic spikes without double-booking. It gracefully manages sold-out events via an automated waitlist and provides dynamic analytics for event organizers.

<details>
  <summary><strong>Table of Contents</strong></summary>
  
  - [🚀 Quick Start Guide (For New Computers)](#-quick-start-guide-for-new-computers)
  - [⚙️ Environment Variables](#️-environment-variables)
  - [📡 API Documentation](#-api-documentation)
  - [🗄️ Database Schema](#️-database-schema)
  - [🧠 System Design & Architecture](#-system-design--architecture)
</details>

---

## 🚀 Quick Start Guide (For New Computers)

Follow these steps exactly to run the project on any new machine. 

### 1️⃣ Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port 27017, or use an Atlas cluster)
- [Git](https://git-scm.com/downloads)

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/vaishnavisrivastavaa/BookIT-Ticket-Booking-System-.git
cd BookIT-Ticket-Booking-System-
```

### 3️⃣ Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create the environment variables file
cp .env.example .env
# Open the .env file in your code editor and update the Database URL and Email settings.

# 3. Generate Prisma ORM Client
npx prisma generate

# 4. Seed the database (Creates initial Roles, Admin, and Venues)
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
> 🎉 **Success!** Open your browser and go to `http://localhost:5174`

---

## ⚙️ Environment Variables

For the backend to work, you must create a `.env` file in the `backend` folder. Here is the template (`.env.example`):

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

---

## 📡 API Documentation

<details>
<summary><strong>🔐 Auth Routes</strong></summary>

- `POST /api/auth/register`: Register as CUSTOMER, ORGANISER, or ADMIN.
- `POST /api/auth/login`: Authenticate and receive a JWT.
</details>

<details>
<summary><strong>🏢 Events & Venues Routes</strong></summary>

- `GET /api/events`: Public list of events.
- `POST /api/events`: (Organiser) Create an event.
- `POST /api/venues`: (Admin) Create a venue.
</details>

<details>
<summary><strong>🎫 Booking & Seats Routes</strong></summary>

- `POST /api/seats/hold`: Hold seats temporarily before payment.
- `POST /api/bookings`: Confirm booking (requires held seats).
- `DELETE /api/bookings/:id/cancel`: Cancel a booking and release seats.
</details>

<details>
<summary><strong>⏳ Waitlist & Support Routes</strong></summary>

- `POST /api/waitlists`: Join the waitlist for a specific event category.
- `POST /api/support/query`: Submit a help center query.
</details>

---

## 🗄️ Database Schema

BookIT relies on a flexible MongoDB structure via the Prisma ORM.

| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| **Users** | Core account system | `id`, `email`, `role_id`, `password` |
| **Roles** | RBAC permissions | `id`, `name` *(ADMIN, ORGANISER, CUSTOMER)* |
| **Venues** | Physical locations | `id`, `name`, `capacity`, `address` |
| **Events** | Scheduled shows | `id`, `title`, `venue_id`, `prices` |
| **Bookings** | User transactions | `id`, `user_id`, `status`, `expires_at` |
| **Waitlist** | Queue for sold-out events | `id`, `user_id`, `event_id`, `status` |

---

## 🧠 System Design & Architecture

The architecture of BookIT strictly prioritizes **data integrity** during high-concurrency flash sales, ensuring that users *never* experience double-booking or system lock-ups.

### 🛡️ Concurrency Prevention
During popular events, thousands of users might attempt to click the exact same seat simultaneously. To handle this, the system avoids standard `SELECT then UPDATE` workflows which are highly vulnerable to race conditions. Instead, we implemented **Optimistic Concurrency Control** directly at the database driver level.

When a user attempts to hold a seat, the backend executes an atomic `updateMany` operation on MongoDB. The query strictly includes `status: 'AVAILABLE'` in its `WHERE` clause. Because MongoDB processes this document update atomically, *only the very first request* to hit the database successfully mutates the seat state (returning a `modifiedCount` of 1). Any concurrent requests occurring at the exact same millisecond fail the condition, immediately triggering a graceful "Locked by another user" error on the frontend. 

### ⏱️ Seat Hold and TTL Mechanism
To prevent malicious users from locking up an entire venue without paying, BookIT employs a strict Time-To-Live (TTL) mechanism. When seats are successfully locked via the atomic update, a `Booking` record is generated with a status of `HELD` and an `expires_at` timestamp set to exactly **10 minutes** in the future. 

The frontend initiates a 10-minute countdown timer during the checkout flow. If payment is completed, the booking transitions to `CONFIRMED`. If the timer expires before payment, the application relies on our automated background worker to handle the release.

### 🔄 Waitlist Auto-assignment Flow
For highly demanded events, ticket categories sell out rapidly. Once a category is unavailable, customers are dynamically presented with a "Join Waitlist" option on the Event Details page. 

The waitlist operates as a strict **First-In-First-Out (FIFO) queue**. Users simply register their intent to purchase a specific category for an event, and their record is stored with a `WAITING` status. 

### ⏳ Time-limited Offer Handling
A background Node.js cron scheduler (running every 5 minutes) acts as the bridge between expired holds and the waitlist queue. 

The scheduler performs the following lifecycle:
1. **Sweeping**: Scans for `HELD` bookings where `expires_at < now()`. It marks these as `EXPIRED` and reverts the associated seats back to `AVAILABLE`.
2. **Matching**: Scans the waitlist queue. If it detects newly `AVAILABLE` seats that match a waitlisted category, it immediately creates a new `HELD` booking for the first user in the queue.
3. **Offer Generation**: The newly created hold is given an extended TTL of **24 hours**. The system automatically fires a transactional email via Nodemailer to the user, providing a secure, time-limited checkout link.
4. **Resolution**: If the waitlisted user fails to complete checkout within 24 hours, the scheduler sweeps the expired hold again and automatically offers the tickets to the next person in line.
