"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLessonProgress = exports.getProgress = exports.enrollInCourse = exports.createLesson = exports.createModule = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const db_1 = __importDefault(require("../config/db"));
// --- Courses ---
const getCourses = async (req, res) => {
    try {
        const isStudent = req.user?.role === 'STUDENT';
        const courses = await db_1.default.course.findMany({
            where: isStudent ? { isPublished: true } : {},
            include: {
                _count: {
                    select: { modules: true, enrollments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving courses', error: error.message });
    }
};
exports.getCourses = getCourses;
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await db_1.default.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                assessments: {
                    where: req.user?.role === 'STUDENT' ? { isPublished: true } : {},
                    include: {
                        _count: { select: { questions: true } },
                    },
                },
                assignments: true,
            },
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving course details', error: error.message });
    }
};
exports.getCourseById = getCourseById;
const createCourse = async (req, res) => {
    try {
        const { title, description, price, isPublished } = req.body;
        let coverImage = null;
        if (req.file) {
            coverImage = `/uploads/${req.file.filename}`;
        }
        const course = await db_1.default.course.create({
            data: {
                title,
                description,
                price: price ? parseFloat(price) : 0.0,
                isPublished: isPublished === 'true' || isPublished === true,
                coverImage,
            },
        });
        res.status(201).json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, isPublished } = req.body;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (isPublished !== undefined)
            updateData.isPublished = isPublished === 'true' || isPublished === true;
        if (req.file) {
            updateData.coverImage = `/uploads/${req.file.filename}`;
        }
        const course = await db_1.default.course.update({
            where: { id },
            data: updateData,
        });
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.course.delete({ where: { id } });
        res.json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};
exports.deleteCourse = deleteCourse;
// --- Modules ---
const createModule = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, order } = req.body;
        const newModule = await db_1.default.module.create({
            data: {
                title,
                order: parseInt(order) || 1,
                courseId,
            },
        });
        res.status(201).json(newModule);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating module', error: error.message });
    }
};
exports.createModule = createModule;
// --- Lessons ---
const createLesson = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, content, fileType, order } = req.body;
        let videoUrl = req.body.videoUrl || null;
        let pdfUrl = req.body.pdfUrl || null;
        if (req.file) {
            const filePath = `/uploads/${req.file.filename}`;
            if (fileType === 'PDF') {
                pdfUrl = filePath;
            }
            else if (fileType === 'VIDEO') {
                videoUrl = filePath;
            }
        }
        const lesson = await db_1.default.lesson.create({
            data: {
                title,
                content: content || null,
                fileType: fileType || 'ARTICLE',
                order: parseInt(order) || 1,
                moduleId,
                videoUrl,
                pdfUrl,
            },
        });
        res.status(201).json(lesson);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating lesson', error: error.message });
    }
};
exports.createLesson = createLesson;
// --- Student Enrollments ---
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const existingEnrollment = await db_1.default.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }
        const course = await db_1.default.course.findUnique({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Free courses can be joined instantly. Paid courses require payment.
        if (course.price > 0) {
            return res.status(402).json({ message: 'Payment required for this course', price: course.price });
        }
        const enrollment = await db_1.default.enrollment.create({
            data: { userId, courseId },
        });
        res.status(201).json({ message: 'Enrolled successfully', enrollment });
    }
    catch (error) {
        res.status(500).json({ message: 'Error enrolling in course', error: error.message });
    }
};
exports.enrollInCourse = enrollInCourse;
// --- Progress ---
const getProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;
        const progress = await db_1.default.userProgress.findMany({
            where: {
                userId,
                lesson: {
                    module: { courseId },
                },
            },
            include: {
                lesson: true,
            },
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching progress', error: error.message });
    }
};
exports.getProgress = getProgress;
const updateLessonProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lessonId } = req.params;
        const { completed } = req.body; // boolean
        const progress = await db_1.default.userProgress.upsert({
            where: {
                userId_lessonId: { userId, lessonId },
            },
            update: {
                completed,
                completedAt: completed ? new Date() : null,
            },
            create: {
                userId,
                lessonId,
                completed,
                completedAt: completed ? new Date() : null,
            },
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating lesson progress', error: error.message });
    }
};
exports.updateLessonProgress = updateLessonProgress;
