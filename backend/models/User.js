const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "technician", "admin"],
        default: "user"
    },
    // New Fields explicitly for Technicians
    skill: {
        type: String, 
        enum: ["carpentry", "electrical", "plumbing", null],
        default: null
    },
    available: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);