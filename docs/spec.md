# 📄 Product Specification: Task Manager (MVP)

## 1. Goal
Build a simple yet powerful Kanban-style task manager where users can create boards, add tasks, move them between columns, and manage their workflow.

---

## 2. Core Features (MVP)
- **User Authentication**: Sign up, log in, and manage your own boards.
- **Board Management**:
  - Create a board (e.g., “Personal”, “Work Project”).
  - Each board has 3 default columns: *To Do*, *In Progress*, *Done*.
- **Task Management**:
  - Create, edit, and delete tasks.
  - Drag-and-drop tasks between columns.
- **Persistence**: Data is stored in a database (we’ll use Postgres with Prisma).
- **Responsive UI**: Works well on desktop and mobile.

---

## 3. Stretch Goals (if time allows)
- Real-time collaboration (using WebSockets or something like Supabase).
- Task due dates & priorities.
- Multiple boards per user with customizable columns.
- Dark mode.

---

## 4. Tech Stack
- **Frontend**: Next.js (App Router), React, TailwindCSS, shadcn/ui.
- **Backend**: Next.js API routes with Prisma + Postgres.
- **Auth**: NextAuth.js (GitHub/Google sign-in or email/password).
- **Hosting**: Vercel for frontend, Supabase/Neon for Postgres.
