import React from "react";
import "./TaskList.css";
import TaskItem from "../TaskItem/TaskItem.jsx";

function TaskList({ title, tasks, emptyMessage, onComplete, onEdit, onDelete, actionTaskId }) {
  return (
    <section className="task-section" aria-label={title}>
      <div className="section-heading">
        <h2>{title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
        <div className="task-items">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              actionInProgress={actionTaskId === task._id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TaskList;