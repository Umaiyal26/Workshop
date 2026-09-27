import "dotenv/config";
import cors from "cors";
import express from "express";
import connectToDatabase from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_URL?.replace(/\/$/, "");
const allowedOrigins = new Set([
  frontendOrigin,
  "https://workshop-1mzj.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json());
app.use("/api/tasks", taskRoutes);
app.use((_req, res) => {
  res.status(404).json({ message: "API endpoint was not found." });
});
app.use(errorHandler);

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Study Planner API is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Could not start the API. Check server/.env and MongoDB network access.");
    process.exitCode = 1;
  }
}

startServer();