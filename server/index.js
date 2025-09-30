import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const app = express();

import { connectDB } from "./db/db.js";
import { authRouter } from "./routes/auth.js";
import { productRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import isValidJwt from "./middleware/isValidJwt.js";
import { suppliersRouter } from "./routes/suppliers.js";
import { inventoryRouter } from "./routes/inventory.js";
import { shopsRouter } from "./routes/shops.js";
import { salesRouter } from "./routes/sales.js";
import { performanceRouter } from "./routes/performance.js";
import { damageRouter } from "./routes/damage.js";
import { logsRouter } from "./routes/logs.js";
import { usersRouter } from "./routes/users.js";

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (SIGINT)");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (SIGTERM)");
  process.exit(0);
});

// This is specific to Nodemon restarts
process.once("SIGUSR2", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (Nodemon restart)");
  process.kill(process.pid, "SIGUSR2");
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://distributor-management.onrender.com", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)
app.use(express.json());

app.get("/api/auth/me", isValidJwt, (req, res) => {
  res
    .status(200)
    .json({
      message: "User is authenticated!",
      email: req.user.email,
      name: req.user.name,
      _id: req.user._id,
      role: req.user.role,
    });
});
app.use("/api/auth", authRouter);
app.use("/api/dashboard", isValidJwt, inventoryRouter);
app.use("/api/dashboard", isValidJwt, suppliersRouter);
app.use("/api/dashboard", isValidJwt, shopsRouter);
app.use("/api/dashboard", isValidJwt, productRouter);
app.use("/api/dashboard", isValidJwt, ordersRouter);
app.use("/api/dashboard", isValidJwt, salesRouter);
app.use("/api/dashboard", isValidJwt, performanceRouter);
app.use("/api/dashboard", isValidJwt, damageRouter);
app.use("/api/dashboard", isValidJwt, logsRouter);
app.use("/api/dashboard", isValidJwt, usersRouter);

app.get("/", (req, res) => {
  res.json({ title: "MAA TARA TRADERS" });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(process.env.PORT || 3000);
  } catch (error) {
    console.error("Failed to start server: ", error);
  }
}
startServer();
