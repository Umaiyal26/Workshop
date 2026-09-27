import React, { useState } from "react";
import "./TaskItem.css";

function TaskItem({ task, onComplete, onEdit, onDelete, actionInProgress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [validationError, setValidationError] = useState("");
  const createdDate = new Date(task.createdAt);
  const dateLabel = Number.isNaN(createdDate.getTime())
    ? ""
    : createdDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  async function handleSave(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError("Task title cannot be empty.");
      return;
    }

    if (trimmedTitle.length > 200) {
      setValidationError("Task title must be 200 characters or fewer.");
      return;
    }

    setValidationError("");
    const saved = await onEdit(task._id, {
      title: trimmedTitle,
      description: description.trim(),
      priority,
    });

    if (saved) {
      setIsEditing(false);
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      onDelete(task._id);
    }
  }

  return (
    <article className={`task-item${task.completed ? " task-item-completed" : ""}`}>
      {isEditing ? (
        <form className="edit-task-form" onSubmit={handleSave}>
          <label>
            Title
            <input
              autoFocus
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              rows="2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label>
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          {validationError && <p className="task-item-error" role="alert">{validationError}</p>}
          <div className="task-actions">
            <button className="task-action-button" type="submit" disabled={actionInProgress}>
              {actionInProgress ? "Saving..." : "Save"}
            </button>
            <button
              className="task-action-button"
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={actionInProgress}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="task-copy">
            <div className="task-title-row">
              <h3>{task.title}</h3>
              <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
            {task.description && <p className="task-description">{task.description}</p>}
            <p className="task-meta">
              {task.completed ? <span className="completed-mark">Completed</span> : "Added"}
              {dateLabel && <> <span aria-hidden="true">·</span> {dateLabel}</>}
            </p>
          </div>
          <div className="task-actions">
            {!task.completed && (
              <button
                className="complete-button"
                type="button"
                onClick={() => onComplete(task._id)}
                disabled={actionInProgress}
              >
                {actionInProgress ? "Saving..." : "Mark complete"}
              </button>
            )}
            <button
              className="task-action-button"
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={actionInProgress}
              aria-label={`Edit ${task.title}`}
            >
              Edit
            </button>
            <button
              className="task-action-button task-delete-button"
              type="button"
              onClick={handleDelete}
              disabled={actionInProgress}
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default TaskItem;