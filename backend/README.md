# UHHomes Backend API

Node.js + Express + MySQL (Sequelize) backend for the UHHomes User Portal.

## Prerequisites

- Node.js 18+
- MySQL 8+ (running locally or remote)

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create MySQL database:**
   ```sql
   CREATE DATABASE uhhomes;
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials and JWT secret
   ```

4. **Seed the database (creates tables + sample data):**
   ```bash
   npm run db:seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

The API will run at `http://localhost:5000`.

## Test Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@uhhomes.com  | Admin@uhHomes12 |
| User  | john@example.com   | User@123  |

## API Endpoints

### Auth
- `POST /users/login` — Email/password login
- `POST /users/register` — Register new user
- `GET /users/current-user` — Get authenticated user
- `POST /users/logout` — Logout
- `GET /auth/google` — Google OAuth redirect
- `GET /auth/google/callback` — Google OAuth callback

### User
- `PUT /users/update` — Update profile
- `PATCH /users/update-password` — Change password
- `POST /users/signup-otp` — Send signup OTP
- `POST /users/verify-signup-otp` — Verify signup OTP
- `POST /users/send-otp` — Send password reset OTP
- `POST /users/verify-otp` — Verify password reset OTP
- `POST /users/reset-password` — Reset password

### Projects
- `GET /user-projects` — Get user's project
- `GET /user-projects/tracker` — Get project with full tracker data
- `GET /user-projects/question` — Get user's questions
- `POST /user-projects/question` — Submit a question

### Favorites
- `GET /favorites` — Get user's favorites
- `POST /favorites/toggle` — Toggle a favorite

### Alerts
- `GET /alerts` — Get alerts (with filters)
- `GET /alerts/unread-count` — Get unread count
- `PATCH /alerts/:id/read` — Mark alert as read
- `PATCH /alerts/read-all` — Mark all as read

### Properties
- `GET /properties` — List all properties
- `GET /properties/:id` — Get property by ID

### Settings
- `GET /settings/notifications` — Get notification preferences
- `PUT /settings/notifications` — Update notification preferences
- `GET /settings/download-data` — Download user data
- `DELETE /settings/account` — Delete account

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI to `http://localhost:5000/auth/google/callback`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`
