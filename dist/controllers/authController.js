"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
exports.authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, city, role = 'viewer' } = req.body;
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = new User_1.User({
                name,
                email,
                password: hashedPassword,
                city,
                role,
            });
            await user.save();
            const token = (0, auth_1.generateToken)(user._id.toString(), user.email, user.role, user.city);
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    city: user.city,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Registration failed' });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email });
            if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = (0, auth_1.generateToken)(user._id.toString(), user.email, user.role, user.city);
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    city: user.city,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Login failed' });
        }
    },
};
//# sourceMappingURL=authController.js.map