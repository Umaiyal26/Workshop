import { Router } from "express";
import {
	completeTask,
	createTask,
	deleteTask,
	getTasks,
	updateTask,
} from "../controllers/taskController.js";

const router = Router();

router.route("/").get(getTasks).post(createTask);
router.route("/:id").patch(updateTask).delete(deleteTask);
router.patch("/:id/complete", completeTask);

export default router;