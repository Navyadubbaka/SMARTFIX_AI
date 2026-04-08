const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Tech is now a User
        default: null
    },
    status: {
        type: String,
        enum: ["Pending Acceptance", "Accepted", "In Progress", "Resolved"],
        default: "Pending Acceptance"
    },
    assignedAt: {
        type: Date,
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    reviewText: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);