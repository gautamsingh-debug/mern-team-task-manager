# Zenith — Team Task Manager

A full-stack Team Task Manager built with the **MERN stack** (MongoDB, Express, React, Node.js) featuring JWT authentication, role-based access control, project & task management, and a beautiful dashboard.

![Zenith](https://img.shields.io/badge/Stack-MERN-blue) ![Auth](https://img.shields.io/badge/Auth-JWT-green) ![CSS](https://img.shields.io/badge/CSS-Tailwind_v3-purple)

---

## Features

- **Authentication** — Signup, Login with JWT tokens and bcrypt password hashing
- **Role-Based Access** — Admin (full control) and Member (view/update assigned tasks)
- **Project Management** — Create projects, add/remove team members
- **Task Management** — Create tasks with status (To Do / In Progress / Done), priority, due date, and assignee
- **Dashboard** — Real-time statistics with stat cards, progress bars, and recent tasks
- **Kanban Board** — Visual task board with drag-free status updates
- **Responsive UI** — Modern glassmorphism design with dark sidebar, works on mobile

---

## Tech Stack

| Layer      | Technology                  |
|------------|----------------------------|
| Frontend   | React 19, Tailwind CSS v3  |
| Backend    | Node.js, Express.js        |
| Database   | MongoDB Atlas (Mongoose)   |
| Auth       | JWT + bcryptjs             |
| Build Tool | Vite                       |

---

## Prerequisites

- **Node.js** >= 18.x
- **MongoDB Atlas** account (or local MongoDB)
- **npm** or **yarn**

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
```

Install dependencies and start:

```bash
npm install
npm run dev
```

The server will run on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The client will run on `http://localhost:5173`.

---

## Project Structure

```
├── server/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth, role, error handlers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routes
│   ├── validators/             # Request validation
│   └── server.js               # Entry point
│
├── client/
│   ├── src/
│   │   ├── api/axios.js        # Axios instance
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Page components
│   │   └── utils/              # Helper functions
│   └── ...config files
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint         | Access | Description      |
|--------|------------------|--------|------------------|
| POST   | /api/auth/signup | Public | Register user    |
| POST   | /api/auth/login  | Public | Login user       |
| GET    | /api/auth/me     | Auth   | Get current user |
| GET    | /api/auth/users  | Auth   | List all users   |

### Projects
| Method | Endpoint                          | Access | Description    |
|--------|-----------------------------------|--------|----------------|
| POST   | /api/projects                     | Admin  | Create project |
| GET    | /api/projects                     | Auth   | List projects  |
| GET    | /api/projects/:id                 | Auth   | Get project    |
| PUT    | /api/projects/:id                 | Admin  | Update project |
| DELETE | /api/projects/:id                 | Admin  | Delete project |
| POST   | /api/projects/:id/members         | Admin  | Add member     |
| DELETE | /api/projects/:id/members/:userId | Admin  | Remove member  |

### Tasks
| Method | Endpoint                      | Access | Description        |
|--------|-------------------------------|--------|--------------------|
| POST   | /api/tasks                    | Admin  | Create task        |
| GET    | /api/tasks/project/:projectId | Auth   | List project tasks |
| GET    | /api/tasks/:id                | Auth   | Get task           |
| PUT    | /api/tasks/:id                | Auth   | Update task        |
| DELETE | /api/tasks/:id                | Admin  | Delete task        |

### Dashboard
| Method | Endpoint           | Access | Description      |
|--------|--------------------|--------|------------------|
| GET    | /api/dashboard/stats | Auth | Get statistics   |

---

## Deployment (Railway)

### Backend
1. Create a new Railway project
2. Add your `server/` directory
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`
4. Start command: `npm start`

### Frontend
1. Add your `client/` directory as another service
2. Set `VITE_API_URL` to your backend Railway URL
3. Build command: `npm run build`
4. Start command: `npx serve dist`

### Monorepo (Single Service)
Alternatively, serve the frontend from the backend in production:
1. Build the client: `cd client && npm run build`
2. The Express server automatically serves `client/dist/` in production mode
3. Set `NODE_ENV=production`

---

## License

MIT
