"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lms-jwt-token-key-change-this-in-production';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
            }
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden: Requires one of these roles: ${roles.join(', ')}` });
        }
        next();
    };
};
exports.requireRoles = requireRoles;
