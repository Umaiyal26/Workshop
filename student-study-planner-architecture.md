# Student Study Planner --- MERN Architecture

## 1. Project Goal

Build a simple Student Study Planner using the MERN stack.

Students should be able to:

-   Add a study task
-   Assign a priority
-   Mark a task as completed
-   View pending tasks
-   View completed tasks

The application should be intentionally simple and
beginner/intermediate-friendly.

------------------------------------------------------------------------

## 2. Features

### MVP Features

#### 2.1 Add Task

A student can create a task with:

-   Task title
-   Optional description
-   Priority: `Low`, `Medium`, or `High`

#### 2.2 View Tasks

Display tasks in two logical views:

-   Pending Tasks
-   Completed Tasks

Each task should show:

-   Title
-   Description, if available
-   Priority
-   Completion status
-   Created date

#### 2.3 Complete Task

A student can mark a pending task as completed.

The UI should provide a clear action such as a checkbox or
`Mark Complete` button.

#### 2.4 Basic Task Management

For the initial version, keep the scope small.

Recommended MVP actions:

-   Create task
-   Mark task complete
-   View pending tasks
-   View completed tasks

Optional features such as edit, delete, search, filtering,
authentication, reminders, and deadlines should be treated as future
enhancements rather than MVP requirements.

------------------------------------------------------------------------

## 3. Suggested Architecture

Use a simple three-layer MERN architecture:

``` text
                    Student
                       |
                       v
              React Frontend
              (Presentation)
                       |
                 HTTP / REST API
                       |
                       v
              Express + Node.js
              (Backend/API)
                       |
                  Mongoose ODM
                       |
                       v
                   MongoDB
                   (Database)
```

### Frontend

**Technology:** React

Responsibilities:

-   Render the task list
-   Provide the add-task form
-   Display pending/completed tasks
-   Send API requests
-   Update the UI after successful API operations
-   Handle basic loading and error states

### Backend

**Technology:** Node.js + Express

Responsibilities:

-   Expose REST API endpoints
-   Validate incoming task data
-   Apply business rules
-   Communicate with MongoDB
-   Return appropriate HTTP status codes and JSON responses

### Database

**Technology:** MongoDB

Responsibilities:

-   Persist student tasks
-   Store task status and priority
-   Store creation/update timestamps

### ODM

**Technology:** Mongoose

Responsibilities:

-   Define the Task schema
-   Validate database-level data
-   Provide a convenient interface for MongoDB operations

------------------------------------------------------------------------

## 4. Suggested Project Structure

``` text
student-study-planner/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm/
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   └── TaskForm.css
│   │   │   ├── TaskList/
│   │   │   │   ├── TaskList.jsx
│   │   │   │   └── TaskList.css
│   │   │   └── TaskItem/
│   │   │       ├── TaskItem.jsx
│   │   │       └── TaskItem.css
│   │   │
│   │   ├── services/
│   │   │   └── taskService.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   └── taskRoutes.js
│   │   ├── tests/
│   │   │   └── test-api.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── README.md
└── .gitignore
```

For a beginner/intermediate project, avoid adding unnecessary folders or
design patterns.

The backend uses MVC responsibilities: models define MongoDB data, controllers validate and handle requests, and routes map API paths to controllers. React in `client/` is the view layer. Each UI component has its own folder under `client/src/components/`.

Component styles live beside their React component. `client/src/index.css` is reserved for global resets, design tokens, and application shell layout.

------------------------------------------------------------------------

## 5. Data Structure

Use a MongoDB collection named `tasks`.

### Task Document

``` javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  priority: String,
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Field Details

  Field           Type         Required Description
  --------------- ---------- ---------- -------------------------------
  `_id`           ObjectId          Yes MongoDB-generated identifier
  `title`         String            Yes Name of the study task
  `description`   String             No Additional information
  `priority`      String            Yes `Low`, `Medium`, or `High`
  `completed`     Boolean           Yes Whether the task is completed
  `createdAt`     Date              Yes Task creation time
  `updatedAt`     Date              Yes Last modification time

Recommended defaults:

``` text
priority  = "Medium"
completed = false
```

------------------------------------------------------------------------

## 6. REST API

### Create Task

``` http
POST /api/tasks
```

Request:

``` json
{
  "title": "Study Operating Systems",
  "description": "Revise process scheduling",
  "priority": "High"
}
```

Response:

``` json
{
  "id": "...",
  "title": "Study Operating Systems",
  "description": "Revise process scheduling",
  "priority": "High",
  "completed": false
}
```

### Get All Tasks

``` http
GET /api/tasks
```

Return all tasks.

The frontend can separate them into pending and completed tasks.

### Mark Task Complete

``` http
PATCH /api/tasks/:id/complete
```

This endpoint changes:

``` text
completed: false
```

to:

``` text
completed: true
```

A future version could support toggling completion.

------------------------------------------------------------------------

## 7. Request Flow

### Adding a Task

``` text
Student
   |
   | fills Task Form
   v
React
   |
   | POST /api/tasks
   v
Express Route
   |
   v
Task Controller
   |
   | validate input
   v
Mongoose
   |
   v
MongoDB
   |
   | saved task
   v
Express
   |
   | JSON response
   v
React
   |
   v
Updated Task List
```

### Completing a Task

``` text
Student clicks "Mark Complete"
              |
              v
           React
              |
              | PATCH /api/tasks/:id/complete
              v
          Express
              |
              v
       Task Controller
              |
              v
           MongoDB
              |
              | completed = true
              v
           React
              |
              v
Task moves from Pending → Completed
```

------------------------------------------------------------------------

## 8. Edge Cases

### Task Creation

1.  Empty title
    -   Reject the request.
    -   Display a useful validation message.
2.  Title containing only spaces
    -   Trim the title and reject it if it becomes empty.
3.  Very long title
    -   Apply a reasonable maximum length, such as 200 characters.
4.  Invalid priority
    -   Accept only `Low`, `Medium`, or `High`.
5.  Missing priority
    -   Use `Medium` as the default.
6.  Missing description
    -   Allow it because description is optional.

### Task Completion

7.  Invalid task ID
    -   Return a `400 Bad Request` or appropriate validation response.
8.  Task does not exist
    -   Return `404 Not Found`.
9.  Completing an already completed task
    -   Handle gracefully without creating duplicate data or an error
        that confuses the user.

### Database / Server

10. MongoDB unavailable
    -   Backend should return an appropriate server error.
    -   Frontend should show a user-friendly error message.
11. API unavailable
    -   Frontend should display a useful error state instead of failing
        silently.
12. Empty task list
    -   Show a message such as `No pending tasks`.

### UI

13. Double submission
    -   Disable the submit button while the request is in progress.
14. Slow API response
    -   Show a loading state.
15. Failed API request
    -   Show an error message and allow the user to retry.

------------------------------------------------------------------------

## 9. HTTP Status Codes

Use conventional status codes:

  Situation                 Status
  ----------------------- --------
  Task created                 201
  Tasks retrieved              200
  Task completed               200
  Invalid input                400
  Task not found               404
  Server/database error        500

------------------------------------------------------------------------

## 10. Frontend State

Keep the initial React state simple.

Recommended state:

``` text
tasks
loading
error
```

The form can maintain its own local state:

``` text
title
description
priority
```

For the MVP, avoid Redux or another global state-management library.
React state plus API service functions is sufficient.

------------------------------------------------------------------------

## 11. Backend Design

Use a simple separation of responsibilities:

``` text
Route
  ↓
Controller
  ↓
Model
  ↓
MongoDB
```

### Routes

Define API paths and HTTP methods.

### Controllers

Handle:

-   Request validation
-   Calling the model
-   Building responses
-   Error handling

### Models

Define the Mongoose schema and interact with MongoDB.

This structure keeps the code understandable without introducing
unnecessary abstraction.

------------------------------------------------------------------------

## 12. Environment Configuration

Use environment variables for configuration.

Example:

``` text
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
```

Do not commit `.env` to Git.

Add it to `.gitignore`.

------------------------------------------------------------------------

## 13. Development Order

Build the project incrementally.

### Phase 1 --- Backend Setup

1.  Create Node.js project.
2.  Install Express, Mongoose, dotenv, and CORS.
3.  Connect to MongoDB.
4.  Create Task model.
5.  Create task routes.
6.  Create controllers.
7.  Test API endpoints.

### Phase 2 --- Frontend Setup

1.  Create React application.
2.  Create basic layout.
3.  Create TaskForm.
4.  Create TaskList.
5.  Create TaskItem.
6.  Connect React to the API.

### Phase 3 --- Integration

1.  Add task from React.
2.  Fetch tasks.
3.  Display pending tasks.
4.  Display completed tasks.
5.  Mark task as completed.
6.  Add loading and error states.

### Phase 4 --- Cleanup

1.  Improve validation.
2.  Improve UI.
3.  Handle edge cases.
4.  Update README.
5.  Test the complete application.

------------------------------------------------------------------------

## 14. Deliberately Excluded from MVP

Do not implement these initially:

-   Authentication
-   Multiple users
-   JWT
-   Role-based access
-   Calendar integration
-   Email notifications
-   Push notifications
-   AI study recommendations
-   Complex state management
-   Deployment
-   Microservices

These can be added later after the basic application works.

------------------------------------------------------------------------

## 15. Future Enhancements

Possible next versions:

-   Edit task
-   Delete task
-   Due date
-   Subject/category
-   Search
-   Filter by priority
-   Sort by priority/date
-   User authentication
-   Personal dashboards
-   Study streaks
-   Progress statistics
-   Recurring study tasks
-   Calendar view
-   Reminder notifications

The MVP should remain small enough to understand and complete before
adding these features.
