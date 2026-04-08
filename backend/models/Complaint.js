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
        enum: ["Pending Acceptance", "Accepted", "In Progress", "Pending Payment", "Resolved"],
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
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Low"
    },
    aiConfidence: {
        type: Number,
        default: null
    },
    billAmount: {
        type: Number,
        default: null
    },
    isPaid: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);