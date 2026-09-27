import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import mongoose from "mongoose";

const apiUrl = "http://127.0.0.1:5000/api/tasks";
const taskIds = [];
const testLabel = `Study Planner API test ${randomUUID()}`;

async function request(path, method = "GET", task) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(task === undefined ? {} : { body: JSON.stringify(task) }),
  });

  return {
    status: response.status,
    body: await response.json().catch(() => null),
  };
}

async function runApiTests() {
  try {
    const highPriorityResult = await request("", "POST", {
      title: `${testLabel} high priority`,
      description: "Temporary integration test task",
      priority: "High",
    });

    assert.equal(highPriorityResult.status, 201);
    taskIds.push(highPriorityResult.body._id);
    assert.equal(highPriorityResult.body.priority, "High");
    assert.equal(highPriorityResult.body.completed, false);
    assert.ok(highPriorityResult.body.createdAt);
    assert.ok(highPriorityResult.body.updatedAt);
    console.log("PASS create task, priority, defaults, and timestamps");

    const defaultPriorityResult = await request("", "POST", {
      title: `${testLabel} default priority`,
    });

    assert.equal(defaultPriorityResult.status, 201);
    taskIds.push(defaultPriorityResult.body._id);
    assert.equal(defaultPriorityResult.body.priority, "Medium");
    console.log("PASS missing priority defaults to Medium");

    const listResult = await request("");
    assert.equal(listResult.status, 200);
    assert.ok(listResult.body.some((task) => task._id === highPriorityResult.body._id));
    assert.ok(listResult.body.some((task) => task._id === defaultPriorityResult.body._id));
    console.log("PASS GET returns tasks persisted in MongoDB");

    const completionResult = await request(`/${highPriorityResult.body._id}/complete`, "PATCH");
    assert.equal(completionResult.status, 200);
    assert.equal(completionResult.body.completed, true);

    const repeatedCompletionResult = await request(`/${highPriorityResult.body._id}/complete`, "PATCH");
    assert.equal(repeatedCompletionResult.status, 200);
    assert.equal(repeatedCompletionResult.body.completed, true);
    console.log("PASS completing tasks, including repeat completion");

    const updateResult = await request(`/${highPriorityResult.body._id}`, "PATCH", {
      title: `${testLabel} edited task`,
      description: "Updated description",
      priority: "Low",
    });
    assert.equal(updateResult.status, 200);
    assert.equal(updateResult.body.title, `${testLabel} edited task`);
    assert.equal(updateResult.body.description, "Updated description");
    assert.equal(updateResult.body.priority, "Low");
    assert.equal(updateResult.body.completed, true);
    console.log("PASS task fields can be edited without changing completion state");

    assert.equal((await request(`/${highPriorityResult.body._id}`, "PATCH", { title: "   " })).status, 400);
    assert.equal((await request(`/${highPriorityResult.body._id}`, "PATCH", { priority: "Urgent" })).status, 400);
    assert.equal((await request("/not-an-object-id", "PATCH", { title: "Invalid ID" })).status, 400);
    console.log("PASS edit validation and invalid-ID responses");

    const deleteResult = await request(`/${defaultPriorityResult.body._id}`, "DELETE");
    assert.equal(deleteResult.status, 200);
    assert.match(deleteResult.body.message, /deleted/i);
    assert.equal((await request(`/000000000000000000000000`, "DELETE")).status, 404);
    assert.equal((await request(`/${defaultPriorityResult.body._id}`, "DELETE")).status, 404);
    console.log("PASS task deletion and missing-task responses");

    const invalidRequests = [
      request("", "POST", { title: "" }),
      request("", "POST", { title: "   " }),
      request("", "POST", { title: "x".repeat(201) }),
      request("", "POST", { title: "Invalid priority", priority: "Urgent" }),
    ];

    for (const result of await Promise.all(invalidRequests)) {
      assert.equal(result.status, 400);
    }
    console.log("PASS empty, whitespace-only, long-title, and invalid-priority validation");

    assert.equal((await request("/not-an-object-id/complete", "PATCH")).status, 400);
    assert.equal((await request("/000000000000000000000000/complete", "PATCH")).status, 404);
    console.log("PASS invalid-ID and task-not-found responses");
  } finally {
    if (taskIds.length > 0) {
      await mongoose.connect(process.env.MONGODB_URI);

      for (const taskId of taskIds) {
        await mongoose.connection.collection("tasks").deleteOne({
          _id: new mongoose.Types.ObjectId(taskId),
        });
      }

      await mongoose.disconnect();
      console.log("Removed temporary integration-test tasks.");
    }
  }
}

runApiTests().catch((error) => {
  console.error("API integration tests failed.");
  console.error(error.message);
  process.exitCode = 1;
});