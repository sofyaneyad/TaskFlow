# TaskFlow - Project & Task Management System
### 7-Day Full-Stack Development Challenge • Version 1.0
**Prepared for:** TAQAT / CodeMap Trainees Evaluation  
**Technologies:** HTML, CSS, JavaScript, React, Next.js (App Router), Tailwind CSS, Firebase (Auth & Cloud Firestore), Git & GitHub

---

## 1. Overview
**TaskFlow** is a modern, responsive web application designed for small software teams to organize projects, assign and manage tasks, track real-time progress, and monitor deadlines. The application emphasizes clean architecture, robust security enforcement via Firestore Security Rules, accessible UI/UX, and strict data persistence.

---

## 2. Core Features (MVP)
* **Authentication & Profile Management (FR-01 to FR-04):**
  * Email and password registration with client validation.
  * Secure Firebase Authentication sessions preserved across page reloads.
  * Public profiles stored in `users/{uid}` without sensitive data or plaintext passwords.
  * Protected routes redirecting unauthenticated visitors to `/login`.
* **Project Management (FR-05, FR-06, FR-07):**
  * Project creation with title (3–80 characters) and optional description.
  * Project list and overview restricted to project owners and members.
  * Project settings (Owner only) for updating details and safe deletion.
  * Team membership management: Add existing users by registered email and remove members.
* **Task Management (FR-08 to FR-12):**
  * Full task lifecycle: To Do, In Progress, Done.
  * Priority levels: Low, Medium, High.
  * Task assignment restricted to active project members.
  * Due dates with automated **Overdue** calculation and visual alerts.
  * Authorization-enforced task updates and deletions.
* **Discovery, Search & Filters (FR-13 & Section 18):**
  * Real-time client-side task title search.
  * Filter by Status, Priority, and Assignee.
  * **Dedicated "Overdue Tasks Only" filter** (compliant with the 30-minute Live Evaluation Exercise).
* **Workspace Dashboard (FR-14):**
  * Metrics: Total Accessible Projects, Total Tasks, Tasks by Status, and Overdue Tasks count.
  * Direct action cards for overdue tasks requiring immediate attention.
* **UI/UX & Accessibility (FR-15, FR-16):**
  * Fully responsive layout tested at mobile (375px), tablet (768px), and desktop (1280px).
  * High-contrast indicators, semantic HTML elements, keyboard navigation, and friendly empty/error states.

---

## 3. Technology Architecture
* **Frontend:** Next.js (App Router) with React 19 and Tailwind CSS.
* **Authentication:** Firebase Authentication (Email/Password provider).
* **Database:** Google Cloud Firestore (NoSQL document store).
* **Hosting:** Vercel / Firebase Hosting compatible.

---

## 4. Firestore Data Model

### Collections Structure:
1. `users/{uid}`
   * `displayName`: string (user's full name)
   * `email`: string (normalized lowercase email)
   * `createdAt`: timestamp

2. `projects/{projectId}`
   * `name`: string (3–80 characters)
   * `description`: string (optional, max 1000 characters)
   * `ownerId`: string (UID of project creator)
   * `memberIds`: array of UIDs (always includes `ownerId`)
   * `createdAt`: timestamp
   * `updatedAt`: timestamp

3. `projects/{projectId}/tasks/{taskId}` *(Subcollection)*
   * `title`: string (3–120 characters)
   * `description`: string (optional, max 1000 characters)
   * `status`: enum (`todo` | `in_progress` | `done`)
   * `priority`: enum (`low` | `medium` | `high`)
   * `dueDate`: string (YYYY-MM-DD) or null
   * `assigneeId`: string (member UID) or null
   * `createdBy`: string (creator UID)
   * `createdAt`: timestamp
   * `updatedAt`: timestamp

---

## 5. Security Rules (`firestore.rules`)
All authorization logic is strictly enforced in `firestore.rules`:
* **Default Deny:** All unauthenticated or out-of-scope reads and writes are blocked by default.
* **Projects:** Readable only if `request.auth.uid in resource.data.memberIds`. Updatable and deletable only by `ownerId`.
* **Tasks:** Reads permitted only to project members. Creation permitted only to project members with valid title lengths, enums, and `createdBy == request.auth.uid`. Updates restricted to owners, creators, and assigned members. Deletion restricted to owners and creators.

---

## 6. Getting Started & Setup

### Prerequisites:
* Node.js v18+ (tested on Node v24)
* A Firebase Project with **Authentication (Email/Password)** and **Cloud Firestore** enabled.

### Installation:
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd taskflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Deploy Firestore Rules:
   Deploy the included `firestore.rules` file to your Firebase console under Cloud Firestore > Rules.

5. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Demo Accounts & Evaluation Instructions (Appendix A)
To test role-based access control and collaboration:
* **Account 1 (Project Owner):**
  * Email: `owner@example.test`
  * Password: `password123`
* **Account 2 (Team Member):**
  * Email: `member@example.test`
  * Password: `password123`

### Workflow Demonstration:
1. Log in as `owner@example.test`.
2. Create project "Website Redesign".
3. Navigate to Project Settings and add `member@example.test` by email.
4. Create tasks and assign one to `member@example.test`.
5. Log in as `member@example.test` in an incognito window. Verify access to the shared project, update assigned task status to `In Progress`, and verify that project deletion and settings are inaccessible.

---

## 8. Known Limitations & Architecture Notes
* In accordance with the MVP specification (Section 2.2), real-time chat, file uploads, billing, and automated email invitations are out of scope.
* Task subcollections are deleted recursively upon project deletion via the application service layer.
