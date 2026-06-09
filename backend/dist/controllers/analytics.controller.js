"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAnalytics = exports.getAdminAnalytics = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAdminAnalytics = async (req, res) => {
    try {
        const totalStudents = await db_1.default.user.count({ where: { role: 'STUDENT' } });
        const totalTeachers = await db_1.default.user.count({ where: { role: 'TEACHER' } });
        const totalCourses = await db_1.default.course.count();
        const successfulPayments = await db_1.default.transaction.findMany({
            where: { status: 'SUCCESSFUL' },
            select: { amount: true },
        });
        const totalRevenue = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);
        const totalAttempts = await db_1.default.examAttempt.count();
        const passedAttempts = await db_1.default.examAttempt.count({ where: { isPassed: true } });
        const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
        const recentEnrollments = await db_1.default.enrollment.findMany({
            take: 5,
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
            orderBy: { enrolledAt: 'desc' },
        });
        const recentTransactions = await db_1.default.transaction.findMany({
            take: 5,
            include: {
                user: { select: { name: true } },
                course: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            summary: {
                totalStudents,
                totalTeachers,
                totalCourses,
                totalRevenue,
                passRate,
            },
            recentEnrollments,
            recentTransactions,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching admin analytics', error: error.message });
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
const getStudentAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollmentsCount = await db_1.default.enrollment.count({ where: { userId } });
        const certificatesCount = await db_1.default.certificate.count({ where: { userId } });
        const attempts = await db_1.default.examAttempt.findMany({
            where: { userId },
            include: {
                assessment: { select: { title: true, type: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const completedProgressCount = await db_1.default.userProgress.count({
            where: { userId, completed: true },
        });
        res.json({
            summary: {
                enrollmentsCount,
                certificatesCount,
                completedProgressCount,
                attemptsCount: attempts.length,
            },
            attempts,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching student analytics', error: error.message });
    }
};
exports.getStudentAnalytics = getStudentAnalytics;
