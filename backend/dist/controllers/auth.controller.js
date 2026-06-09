"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getAllUsers = exports.getProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lms-jwt-token-key-change-this-in-production';
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await db_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'STUDENT', // Force all public registration to be STUDENT
            },
        });
        // Automatically enroll students in published courses if needed or send success
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await db_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error loading profile', error: error.message });
    }
};
exports.getProfile = getProfile;
// Admin User Manager: List all users
const getAllUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving users list', error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
// Admin User Manager: Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role parameter' });
        }
        // Optional safety: Prevent the logged-in admin from demoting themselves!
        if (req.user?.id === userId) {
            return res.status(400).json({ message: 'Self demotion is disabled for security reasons.' });
        }
        const updatedUser = await db_1.default.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        res.json({ message: 'User role updated successfully', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};
exports.updateUserRole = updateUserRole;
