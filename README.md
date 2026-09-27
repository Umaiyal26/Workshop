# Student Study Planner

A small MERN application for keeping track of study tasks. Add a task with a priority, then mark it complete when you finish. Tasks are stored in MongoDB and remain available after a browser refresh.

## Requirements

- Node.js 20 or newer, which includes npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Configure MongoDB

Open a terminal in the `server` folder and copy the example environment file:

```powershell
Copy-Item .env.example .env
```

The copied file contains a placeholder URI, not working credentials. For local MongoDB, set `MONGODB_URI` to `mongodb://127.0.0.1:27017/student-study-planner`. For Atlas, replace it in `server/.env` with your Atlas connection string. Keep credentials only in `server/.env`; never put them in `.env.example` or share them in chat. The root `.gitignore` excludes `.env` files.

If you previously pasted an Atlas password into `.env.example` or shared it, rotate that password in Atlas before using a replacement connection string.

## Start the application

Use two terminals. Start MongoDB first, if you are using a local installation.

In terminal 1, start the API:

```powershell
cd server
npm.cmd install
npm.cmd run dev
```

The API waits for a successful MongoDB connection before listening at `http://localhost:5000`. A connection or configuration failure is printed in the terminal.

In terminal 2, start the React application:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Vite forwards `/api` requests to the Express server on port 5000.

## API

| Method | Path | Result |
| --- | --- | --- |
| `GET` | `/api/tasks` | Returns all tasks, newest first |
| `POST` | `/api/tasks` | Creates a task and returns `201` |
| `PATCH` | `/api/tasks/:id` | Updates supplied task fields after validation |
| `DELETE` | `/api/tasks/:id` | Deletes a task |
| `PATCH` | `/api/tasks/:id/complete` | Marks a task complete and returns `200` |

Task titles are required, trimmed, and limited to 200 characters. Description is optional. Priority must be `Low`, `Medium`, or `High`; if omitted, it defaults to `Medium`. New tasks start with `completed: false`. Mongoose maintains `createdAt` and `updatedAt` timestamps.

Invalid request data and malformed task IDs return `400`; a valid ID that does not match a task returns `404`. Completing a task more than once is safe and returns the completed task. Tasks can be edited inline or deleted from either list; deletion asks for confirmation first.

## Try the API in PowerShell

Create a task:

```powershell
$body = @{ title = "Study Operating Systems"; description = "Revise process scheduling"; priority = "High" } | ConvertTo-Json
$task = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/tasks -ContentType "application/json" -Body $body
$task
```

List tasks:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/tasks
```

Complete the task created above:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:5000/api/tasks/$($task._id)/complete"
```

## Run API integration checks

With the API running in another terminal and MongoDB connected, run this from the `server` folder:

```powershell
npm.cmd run test:api
```

The script checks task creation, listing, editing, completion, deletion, defaults, validation, invalid IDs, and missing tasks. It removes the temporary tasks it creates.

## Project layout

```text
client/                 React UI and Vite development server
  src/components/       One folder per UI component
    TaskForm/            TaskForm.jsx and TaskForm.css
    TaskItem/            TaskItem.jsx and TaskItem.css
    TaskList/            TaskList.jsx and TaskList.css
  src/services/         fetch-based API functions
server/                 Express REST API
  src/                   Backend application source
    config/              MongoDB connection
    controllers/         Task request handling and validation
    middleware/          Consistent API errors
    models/              Mongoose Task schema (Model)
    routes/              REST endpoints mapped to controllers
    tests/               API integration test script
    server.js            Express application entry point
student-study-planner-architecture.md  Original architecture notes
```

The API follows MVC responsibilities: Mongoose models represent data, controllers implement request handling and task rules, and Express routes map HTTP requests to controllers. React is the view layer, kept in the separate `client` application.

Each React component imports its stylesheet from its own folder. `client/src/index.css` contains only global resets, design tokens, and app-shell layout styles.