import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

import { authenticateJWT, requireRoles } from './middleware/auth.middleware';
import * as authController from './controllers/auth.controller';
import * as courseController from './controllers/course.controller';
import * as examController from './controllers/exam.controller';
import * as paymentController from './controllers/payment.controller';
import * as aiController from './controllers/ai.controller';
import * as analyticsController from './controllers/analytics.controller';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable security headers, CORS, logger, and body parsers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local file uploads on frontend
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Configure local file uploads via Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|mp4|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, PDF, and MP4/MKV video files are allowed!'));
    }
  },
});

// --- API ROUTES ---

// Authentication
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authenticateJWT, authController.getProfile);

// Courses & Content Management
app.get('/api/courses', authenticateJWT, courseController.getCourses);
app.get('/api/courses/:id', authenticateJWT, courseController.getCourseById);
app.post('/api/courses', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), upload.single('coverImage'), courseController.createCourse);
app.put('/api/courses/:id', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), upload.single('coverImage'), courseController.updateCourse);
app.delete('/api/courses/:id', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), courseController.deleteCourse);

// Modules & Lessons
app.post('/api/courses/:courseId/modules', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), courseController.createModule);
app.post('/api/modules/:moduleId/lessons', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), upload.single('lessonFile'), courseController.createLesson);

// Enrollment & Progress
app.post('/api/courses/:courseId/enroll', authenticateJWT, courseController.enrollInCourse);
app.get('/api/courses/:courseId/progress', authenticateJWT, courseController.getProgress);
app.put('/api/lessons/:lessonId/progress', authenticateJWT, courseController.updateLessonProgress);

// CBT Exams & Assessments
app.post('/api/courses/:courseId/assessments', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), examController.createAssessment);
app.post('/api/assessments/:assessmentId/questions', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), examController.addQuestionToAssessment);
app.get('/api/assessments/:id/questions', authenticateJWT, examController.getAssessmentQuestions);
app.post('/api/assessments/:assessmentId/attempts', authenticateJWT, examController.startAttempt);
app.post('/api/attempts/:id/submit', authenticateJWT, examController.submitAttempt);
app.get('/api/attempts', authenticateJWT, examController.getAttempts);

// Payments (Paystack & Flutterwave)
app.post('/api/payments/initialize', authenticateJWT, paymentController.initializePayment);
app.get('/api/payments/verify/:reference', authenticateJWT, paymentController.verifyPayment);

// AI Question Solver
app.post('/api/ai/solve', authenticateJWT, aiController.solveQuestion);

// Dashboards Analytics
app.get('/api/analytics/admin', authenticateJWT, requireRoles(['ADMIN', 'TEACHER']), analyticsController.getAdminAnalytics);
app.get('/api/analytics/student', authenticateJWT, analyticsController.getStudentAnalytics);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`LMS Server running on http://localhost:${PORT}`);
});
