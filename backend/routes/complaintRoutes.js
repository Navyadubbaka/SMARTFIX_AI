const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {
    createComplaint,
    updateStatus,
    getAllComplaints,
    getUserComplaints,
    getAvailableJobs,
    acceptJob,
    startJob,
    resolveJob,
    payBill,
    rateJob,
    getTechComplaints
} = require("../controllers/complaintController");

// General / Admin
router.post("/create", upload.single("image"), createComplaint);
router.put("/update-status/:id", updateStatus);
router.get("/all", getAllComplaints);

// User
router.get("/user/:userId", getUserComplaints);
router.put("/pay/:id", payBill);
router.put("/rate/:id", rateJob);

// Technician
router.get("/available/:techId", getAvailableJobs);
router.get("/tech/:techId", getTechComplaints);
router.put("/accept/:id", acceptJob);
router.put("/start/:id", startJob);
router.put("/resolve/:id", resolveJob);

module.exports = router;