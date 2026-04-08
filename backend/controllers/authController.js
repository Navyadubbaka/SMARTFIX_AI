const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 🔐 Register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, skill } = req.body;

        // Check existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create user
        const userData = {
            name,
            email,
            password,
            role: role || "user"
        };
        
        if (userData.role === "technician") {
            userData.skill = skill;
            userData.available = true;
            userData.rating = 0;
            userData.reviewCount = 0;
        }

        const user = await User.create(userData);

        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔐 Login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            "secretkey",
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔐 Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔐 Delete User (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};