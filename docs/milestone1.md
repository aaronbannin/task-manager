# 🎯 Milestone 1: Authentication + Basic Boards

## User Story
“As a user, I want to sign up, log in, and see a default board with 3 columns (*To Do, In Progress, Done*), so that I can immediately start creating and moving tasks.”

---

## Scope of Milestone 1
✅ Must have:
- **Auth** (Sign up / Log in / Log out).
- **Board auto-creation** for each new user (1 default board).
- **3 fixed columns** (*To Do, In Progress, Done*).
- **Task creation** (simple: title only).
- **Tasks persist** in the database.

⚠️ Won’t have yet:
- Multiple boards per user.
- Custom column names.
- Task editing, priorities, or due dates.
- Drag-and-drop (just basic CRUD first).

---

## Acceptance Criteria
- User can register → redirected to their board.
- Board shows **3 default columns**.
- User can add tasks (title only) under “To Do”.
- Tasks persist on page reload.
- Authenticated users see **only their board & tasks**.

---

## Stretch (Optional if time)
- Move tasks between columns via dropdown (before drag-and-drop UI).

---

💡 **Your Job (Engineering)**:
- Define schema for **User, Board, Column, Task** to support this milestone.
- Make sure relationships support future growth (multiple boards, custom columns, richer tasks).
