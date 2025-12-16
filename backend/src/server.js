import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import {ENV} from "./lib/env.js";
import { protectRoute } from "./middleware/auth.middleware.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Dynamically locate frontend build
const frontendPath = path.resolve(__dirname, "../../frontend/dist");


if (ENV.NODE_ENV === "production") {
    app.use(express.static(frontendPath));
    app.get("*", (_, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}



connectDB().then(() => {
    app.listen(PORT, () => console.log("Server running on port " + PORT));
});
