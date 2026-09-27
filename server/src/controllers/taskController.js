import mongoose from "mongoose";
import Task from "../models/Task.js";

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function createTask(req, res, next) {
  try {
    const { title, description, priority } = req.body ?? {};

    if (typeof title !== "string" || title.trim() === "") {
      throw createHttpError(400, "Please enter a task title.");
    }

    if (title.trim().length > 200) {
      throw createHttpError(400, "Task title must be 200 characters or fewer.");
    }

    if (description !== undefined && typeof description !== "string") {
      throw createHttpError(400, "Description must be text.");
    }

    if (priority !== undefined && !["Low", "Medium", "High"].includes(priority)) {
      throw createHttpError(400, "Priority must be Low, Medium, or High.");
    }

    const task = await Task.create({ title, description, priority });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function getTasks(_req, res, next) {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function completeTask(req, res, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw createHttpError(400, "Task ID is invalid.");
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw createHttpError(404, "Task was not found.");
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw createHttpError(400, "Task ID is invalid.");
    }

    const { title, description, priority } = req.body ?? {};
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        throw createHttpError(400, "Please enter a task title.");
      }

      if (title.trim().length > 200) {
        throw createHttpError(400, "Task title must be 200 characters or fewer.");
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        throw createHttpError(400, "Description must be text.");
      }

      updates.description = description.trim();
    }

    if (priority !== undefined) {
      if (!["Low", "Medium", "High"].includes(priority)) {
        throw createHttpError(400, "Priority must be Low, Medium, or High.");
      }

      updates.priority = priority;
    }

    if (Object.keys(updates).length === 0) {
      throw createHttpError(400, "Provide at least one task field to update.");
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      throw createHttpError(404, "Task was not found.");
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw createHttpError(400, "Task ID is invalid.");
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      throw createHttpError(404, "Task was not found.");
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
}