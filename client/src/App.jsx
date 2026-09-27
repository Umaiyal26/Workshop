import React, { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm/TaskForm.jsx";
import TaskList from "./components/TaskList/TaskList.jsx";
import {
  createTask,
  deleteTask,
  getTasks,
  markTaskComplete,
  updateTask,
} from "./services/taskService.js";

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionTaskId, setActionTaskId] = useState("");
  const [error, setError] = useState("");
  const [canRetryLoad, setCanRetryLoad] = useState(false);

  async function loadTasks() {
    setIsLoading(true);
    setError("");
    setCanRetryLoad(false);

    try {
      setTasks(await getTasks());
    } catch (requestError) {
      setError(requestError.message);
      setCanRetryLoad(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleAddTask(taskDetails) {
    setIsSubmitting(true);
    setError("");
    setCanRetryLoad(false);

    try {
      const newTask = await createTask(taskDetails);
      setTasks((currentTasks) => [newTask, ...currentTasks]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteTask(taskId) {
    setActionTaskId(taskId);
    setError("");
    setCanRetryLoad(false);

    try {
      const completedTask = await markTaskComplete(taskId);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task._id === taskId ? completedTask : task))
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionTaskId("");
    }
  }

  async function handleEditTask(taskId, taskDetails) {
    setActionTaskId(taskId);
    setError("");
    setCanRetryLoad(false);

    try {
      const updatedTask = await updateTask(taskId, taskDetails);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setActionTaskId("");
    }
  }

  async function handleDeleteTask(taskId) {
    setActionTaskId(taskId);
    setError("");
    setCanRetryLoad(false);

    try {
      await deleteTask(taskId);
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionTaskId("");
    }
  }

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Study Planner home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>study planner</span>
        </a>
        <span className="topbar-note">A little progress, every day</span>
      </header>

      <div className="planner-content" id="top">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">YOUR STUDY SPACE</p>
          <h1 id="page-title">Make time for<br /><span>what matters.</span></h1>
          <p className="intro-copy">Keep your next study session clear, focused, and easy to begin.</p>
          <div className="progress-note" aria-live="polite">
            <span className="progress-number">{completedTasks.length}</span>
            <span>{completedTasks.length === 1 ? "task" : "tasks"} completed so far</span>
          </div>
        </section>

        <section className="workspace" aria-label="Study tasks">
          <section className="add-section" aria-labelledby="add-heading">
            <div className="section-heading add-heading">
              <div>
                <p className="eyebrow">START SOMETHING</p>
                <h2 id="add-heading">Add a study task</h2>
              </div>
              <span className="plus-mark" aria-hidden="true">+</span>
            </div>
            <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />
          </section>

          {error && (
            <div className="error-banner" role="alert">
              <p>{error}</p>
              {canRetryLoad && (
                <button type="button" onClick={loadTasks}>Retry loading tasks</button>
              )}
            </div>
          )}

          <div className="lists-heading">
            <div>
              <p className="eyebrow">YOUR CHECKLIST</p>
              <h2>Study tasks</h2>
            </div>
            <span className="total-count">{tasks.length} total</span>
          </div>

          {isLoading ? (
            <p className="loading-message" role="status">Loading your tasks...</p>
          ) : canRetryLoad ? (
            <p className="loading-message" role="status">Your task lists will appear when the API is available.</p>
          ) : (
            <div className="task-columns">
              <TaskList
                title="Pending"
                tasks={pendingTasks}
                emptyMessage="Nothing pending. Add a task to get started."
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                actionTaskId={actionTaskId}
              />
              <TaskList
                title="Completed"
                tasks={completedTasks}
                emptyMessage="Completed tasks will show up here."
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                actionTaskId={actionTaskId}
              />
            </div>
          )}
        </section>
      </div>

      <footer className="page-footer">One focused session at a time.</footer>
    </main>
  );
}

export default App;