const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getAllUsers, toggleBlockUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-block", toggleBlockUser);

module.exports = router;