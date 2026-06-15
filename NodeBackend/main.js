import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRouter.js";

dotenv.config();
console.log("JWT_SECRET =", process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use("/products", productRoutes);

// Default Route
app.get("/", (req, res) => {
    res.json({
        code: 200,
        message: "Product Catalog API Running"
    });
});

// Port
const PORT = process.env.PORT || 8080;

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})
app.use("/auth", authRoutes);

app.use("/products", productRoutes);