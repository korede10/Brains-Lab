"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_middleware_1 = require("./middleware/auth.middleware");
const authController = __importStar(require("./controllers/auth.controller"));
const courseController = __importStar(require("./controllers/course.controller"));
const examController = __importStar(require("./controllers/exam.controller"));
const paymentController = __importStar(require("./controllers/payment.controller"));
const aiController = __importStar(require("./controllers/ai.controller"));
const analyticsController = __importStar(require("./controllers/analytics.controller"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable security headers, CORS, logger, and body parsers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false // Allows loading local file uploads on frontend
}));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(uploadsDir));
// Configure local file uploads via Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|mp4|mkv/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only JPEG, PNG, PDF, and MP4/MKV video files are allowed!'));
        }
    },
});
// --- API ROUTES ---
// Authentication
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', auth_middleware_1.authenticateJWT, authController.getProfile);
// Courses & Content Management
app.get('/api/courses', auth_middleware_1.authenticateJWT, courseController.getCourses);
app.get('/api/courses/:id', auth_middleware_1.authenticateJWT, courseController.getCourseById);
app.post('/api/courses', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), upload.single('coverImage'), courseController.createCourse);
app.put('/api/courses/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), upload.single('coverImage'), courseController.updateCourse);
app.delete('/api/courses/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), courseController.deleteCourse);
// Modules & Lessons
app.post('/api/courses/:courseId/modules', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), courseController.createModule);
app.post('/api/modules/:moduleId/lessons', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), upload.single('lessonFile'), courseController.createLesson);
// Enrollment & Progress
app.post('/api/courses/:courseId/enroll', auth_middleware_1.authenticateJWT, courseController.enrollInCourse);
app.get('/api/courses/:courseId/progress', auth_middleware_1.authenticateJWT, courseController.getProgress);
app.put('/api/lessons/:lessonId/progress', auth_middleware_1.authenticateJWT, courseController.updateLessonProgress);
// CBT Exams & Assessments
app.post('/api/courses/:courseId/assessments', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), examController.createAssessment);
app.post('/api/assessments/:assessmentId/questions', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), examController.addQuestionToAssessment);
app.get('/api/assessments/:id/questions', auth_middleware_1.authenticateJWT, examController.getAssessmentQuestions);
app.post('/api/assessments/:assessmentId/attempts', auth_middleware_1.authenticateJWT, examController.startAttempt);
app.post('/api/attempts/:id/submit', auth_middleware_1.authenticateJWT, examController.submitAttempt);
app.get('/api/attempts', auth_middleware_1.authenticateJWT, examController.getAttempts);
// Payments (Paystack & Flutterwave)
app.post('/api/payments/initialize', auth_middleware_1.authenticateJWT, paymentController.initializePayment);
app.get('/api/payments/verify/:reference', auth_middleware_1.authenticateJWT, paymentController.verifyPayment);
// AI Question Solver
app.post('/api/ai/solve', auth_middleware_1.authenticateJWT, aiController.solveQuestion);
// Dashboards Analytics
app.get('/api/analytics/admin', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'TEACHER']), analyticsController.getAdminAnalytics);
app.get('/api/analytics/student', auth_middleware_1.authenticateJWT, analyticsController.getStudentAnalytics);
// Admin User Management
app.get('/api/admin/users', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), authController.getAllUsers);
app.put('/api/admin/users/:userId/role', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), authController.updateUserRole);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`LMS Server running on http://localhost:${PORT}`);
});
