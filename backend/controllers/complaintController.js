const Complaint = require("../models/Complaint");
const axios = require("axios");
const User = require("../models/User"); // Now using User for technicians
const fs = require("fs");
const FormData = require("form-data");

// 🔥 CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
    try {
        const { description, userId } = req.body;
        console.log("📥 Incoming Request");

        // 🔥 Prepare form data (send image to AI)
        const formData = new FormData();
        formData.append("image", fs.createReadStream(req.file.path));

        console.log("📤 Sending image to AI...");

        // 🔥 Call AI API
        const response = await axios.post(
            "http://localhost:8000/predict",
            formData,
            { headers: formData.getHeaders() }
        );

        const category = response.data.category;
        const confidence = response.data.confidence || null;

        if (category === "Unclear") {
            return res.status(400).json({ 
                error: "AI Unsure", 
                message: response.data.message || "We couldn't clearly identify the issue. Please upload a clearer image or provide more description." 
            });
        }

        console.log("🤖 AI Response Category:", category, "| Confidence:", confidence);

        // Determine priority based on category
        let priority = "Low";
        if (category === "electrical" || category === "fire") {
            priority = "High";
        } else if (category === "plumbing") {
            priority = "Medium";
        }

        // 🔥 Save complaint without forcefully auto-assigning
        // Technicians will see this in their dashboard and must click "Accept"
        const complaint = await Complaint.create({
            userId,
            description,
            image: req.file.filename,
            category,
            aiConfidence: confidence,
            priority,
            technicianId: null,
            status: "Pending Acceptance"
        });

        console.log("💾 Complaint Saved:", complaint._id);
        req.app.get("io").emit("complaintUpdated", { message: "New complaint created" });

        res.status(201).json({
            message: "Complaint submitted successfully and is awaiting Technician acceptance.",
            complaint,
            category
        });

    } catch (error) {
        console.log("🔥 ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔥 GET AVAILABLE JOBS FOR TECHNICIAN
exports.getAvailableJobs = async (req, res) => {
    try {
        // Fetch User (technician) to get their skill
        const tech = await User.findById(req.params.techId);
        if (!tech || tech.role !== "technician") return res.status(403).json({ message: "Invalid technician" });

        const openComplaints = await Complaint.find({
            category: { $regex: tech.skill.trim(), $options: "i" },
            status: "Pending Acceptance"
        }).populate("userId", "name email");

        res.json(openComplaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 ACCEPT JOB
exports.acceptJob = async (req, res) => {
    try {
        const { techId } = req.body;
        
        // Find complaint first to check status
        const existingComplaint = await Complaint.findById(req.params.id);
        if (!existingComplaint) return res.status(404).json({ message: "Job not found" });
        
        if (existingComplaint.status !== "Pending Acceptance" || existingComplaint.technicianId) {
            return res.status(400).json({ message: "Job has already been accepted by another technician." });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { 
                technicianId: techId, 
                status: "Accepted",
                assignedAt: new Date()
            },
            { new: true }
        );

        // Mark technician busy
        await User.findByIdAndUpdate(techId, { available: false });
        
        req.app.get("io").emit("complaintUpdated", { message: "Job accepted", complaintId: complaint._id, status: "Accepted" });

        res.json({ message: "Job Accepted", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 START JOB
exports.startJob = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: "In Progress" },
            { new: true }
        );
        req.app.get("io").emit("complaintUpdated", { message: "Job started" });
        res.json({ message: "Job started", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 RESOLVE JOB (Now sets to Pending Payment)
exports.resolveJob = async (req, res) => {
    try {
        const { billAmount } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { 
                status: "Pending Payment", 
                billAmount: billAmount || 0 
            },
            { new: true }
        );

        req.app.get("io").emit("complaintUpdated", { message: "Job awaiting payment", status: "Pending Payment" });

        res.json({ message: "Job marked for payment", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 PAY BILL (Sets to Resolved)
exports.payBill = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { 
                status: "Resolved", 
                isPaid: true,
                resolvedAt: new Date() 
            },
            { new: true }
        );

        // Mark tech available again
        if (complaint.technicianId) {
            await User.findByIdAndUpdate(complaint.technicianId, { available: true });
        }
        
        req.app.get("io").emit("complaintUpdated", { message: "Payment successful, Job resolved", status: "Resolved" });

        res.json({ message: "Payment Successful", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 RATE JOB
exports.rateJob = async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { rating, reviewText },
            { new: true }
        );

        // Update technician's global average rating
        if (complaint.technicianId) {
            const tech = await User.findById(complaint.technicianId);
            const newTotalCount = tech.reviewCount + 1;
            const newAverage = ((tech.rating * tech.reviewCount) + rating) / newTotalCount;
            
            await User.findByIdAndUpdate(tech._id, {
                rating: newAverage,
                reviewCount: newTotalCount
            });
        }

        req.app.get("io").emit("complaintUpdated", { message: "Job rated" });
        res.json({ message: "Review submitted successfully", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 UPDATE STATUS (Admin fallback)
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        req.app.get("io").emit("complaintUpdated", { message: "Status updated" });
        res.json({ message: "Status updated successfully", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 GET ALL COMPLAINTS (Admin)
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("userId", "name email")
            .populate("technicianId", "name skill rating");
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 GET USER COMPLAINTS
exports.getUserComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.params.userId })
            .populate("technicianId", "name rating phone")
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔥 GET TECHNICIAN COMPLAINTS
exports.getTechComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ technicianId: req.params.techId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};