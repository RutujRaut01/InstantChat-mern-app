import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

console.log("Serving static files from:", path.join(__dirname, "../frontend/dist"));

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));
    app.get("*", (_, res) =>{
        res.sendFile(path.join(__dirname, "../frontend","dist", "index.html"));
    });
}

app.listen(PORT, ()=> console.log("Server running on port "+ PORT));
