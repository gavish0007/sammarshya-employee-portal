# Sammarshya Employee Portal

A front-end employee portal built with plain HTML, CSS, and JavaScript. It gives employees a single dashboard to track work sessions, manage daily tasks, log attendance, and apply for leave — all running client-side, with data persisted in the browser via `localStorage`.

## Features

- **Dashboard (Home)** — Personalized greeting, quick-access shortcuts, live work session timer with sign-in/sign-out, daily progress bar (based on an 8-hour target), and an upcoming holidays panel.
- **To Do** — Kanban-style task board (Pending / In Progress / Completed) with drag-and-drop cards, task descriptions, due dates, and live task counters.
- **Attendance** — Work session tracking with date-wise history, daily hours logged against an 8-hour target.
- **Leave Management** — Leave request form (type, date range, reason), leave balance tracking, and a submitted leave history table.

## Tech Stack

- **HTML5** — page structure (`index.html`, `todo.html`, `attendance.html`, `leave.html`)
- **CSS3** — shared base styles in `css/style.css` plus a page-specific stylesheet for each section
- **Vanilla JavaScript** — one script per feature (`js/main.js`, `js/todo.js`, `js/attendance.js`, `js/leave.js`), no frameworks or build step
- **Font Awesome** (via CDN) — icons
- **Browser `localStorage`** — client-side data persistence (no backend/database)

## Project Structure

```
sammarshya-employee-portal-master/
├── index.html          # Dashboard / home page
├── todo.html            # To Do kanban board
├── attendance.html       # Attendance tracker
├── leave.html            # Leave management
├── css/
│   ├── style.css         # Shared/base styles (sidebar, navbar, layout)
│   ├── home.css           # Dashboard-specific styles
│   ├── todo.css           # To Do board styles
│   ├── attendance.css     # Attendance page styles
│   └── leave.css          # Leave page styles
├── js/
│   ├── main.js            # Dashboard session timer & progress logic
│   ├── todo.js             # Task board (drag & drop, counters)
│   ├── attendance.js        # Work session history tracking
│   └── leave.js             # Leave requests, balance, and history
└── assets/
    └── logo/
        └── logo.jpeg      # Portal logo
```

## Getting Started

No build tools or dependencies are required.

1. Download or clone this project.
2. Open `index.html` directly in a web browser (double-click, or right-click → Open With → Browser).

That's it — the app runs entirely in the browser.

> **Tip:** For the best experience (and to avoid any browser restrictions on local files), you can serve the folder with a simple local server, e.g.:
> ```bash
> npx serve .
> ```
> or, with Python:
> ```bash
> python3 -m http.server
> ```
> then visit `http://localhost:PORT` in your browser.

## Notes

- All data (tasks, attendance history, leave requests/balance) is stored in the browser's `localStorage`, so it's tied to a specific browser on a specific device and will persist across page reloads until cleared.
- This is a front-end prototype — there is no backend, authentication, or database. It's intended as a demo/learning project for the Sammarshya employee workflow.

## License

This project currently has no license specified. Add one here if you plan to share or open-source it.
