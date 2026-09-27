import React, { useState } from "react";
import "./TaskForm.css";

function TaskForm({ onAddTask, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setApiError("");
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError("Enter a task title before adding it.");
      return;
    }

    if (trimmedTitle.length > 200) {
      setValidationError("Keep the title to 200 characters or fewer.");
      return;
    }

    setValidationError("");

    try {
      await onAddTask({ title: trimmedTitle, description: description.trim(), priority });
      setTitle("");
      setDescription("");
      setPriority("Medium");
    } catch (error) {
      setApiError(error.message);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="task-title">What are you studying?</label>
        <input
          id="task-title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="e.g. Review process scheduling"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-describedby="title-hint"
          required
        />
        <span className="field-hint" id="title-hint">{title.length}/200 characters</span>
      </div>

      <div className="field-group">
        <label htmlFor="task-description">Notes <span className="optional-label">Optional</span></label>
        <textarea
          id="task-description"
          name="description"
          rows="3"
          placeholder="Add a chapter, topic, or a little context"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="form-footer">
        <div className="field-group priority-field">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            name="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button className="add-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding task..." : "Add task"}
        </button>
      </div>

      {validationError && <p className="task-form-error" role="alert">{validationError}</p>}
      {apiError && <p className="task-form-error" role="alert">{apiError}</p>}
    </form>
  );
}

export default TaskForm;