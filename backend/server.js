const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/uploads", express.static("uploads"));

// 🔥 MongoDB Atlas Connection
mongoose.connect("mongodb+srv://smartfix_user:smartfix123@smartfix-cluster.m3nk2to.mongodb.net/smartfix")
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.log("DB Error:", err));
mongoose.connection.once("open", () => {
    console.log("Connected DB:", mongoose.connection.name);
});
// Test Route
app.get("/", (req, res) => {
    res.send("SmartFix Backend Running 🚀");
});

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Set io inside app so controllers can use it via req.app.get('io')
app.set("io", io);

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Server Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});