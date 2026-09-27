async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the Study Planner API. Check that the server is running.");
  }

  const responseText = await response.text();
  let result = {};

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = {};
  }

  if (!response.ok) {
    const message = result.message || (
      response.status >= 500
        ? "The Study Planner API is unavailable. Check that the server and MongoDB are running."
        : "The request failed. Please try again."
    );
    throw new Error(message);
  }

  return result;
}

export function getTasks() {
  return request("/api/tasks");
}

export function createTask(taskDetails) {
  return request("/api/tasks", {
    method: "POST",
    body: JSON.stringify(taskDetails),
  });
}

export function markTaskComplete(taskId) {
  return request(`/api/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
}

export function updateTask(taskId, taskDetails) {
  return request(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(taskDetails),
  });
}

export function deleteTask(taskId) {
  return request(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
}