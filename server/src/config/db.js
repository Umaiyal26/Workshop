import mongoose from "mongoose";

async function connectToDatabase() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  await mongoose.connect(connectionString);
  console.log("Connected to MongoDB.");
}

export default connectToDatabase;