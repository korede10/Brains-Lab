import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// --- Courses ---
export const getCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isStudent = req.user?.role === 'STUDENT';
    const courses = await prisma.course.findMany({
      where: isStudent ? { isPublished: true } : {},
      include: {
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
};

export const getCourseById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving course details', error: error.message });
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, price, isPublished } = req.body;
    let coverImage = null;
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: price ? parseFloat(price) : 0.0,
        isPublished: isPublished === 'true' || isPublished === true,
        coverImage,
      },
    });

    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, isPublished } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;
    
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// --- Modules ---
export const createModule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, order } = req.body;

    const newModule = await prisma.module.create({
      data: {
        title,
        order: parseInt(order) || 1,
        courseId,
      },
    });

    res.status(201).json(newModule);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating module', error: error.message });
  }
};

// --- Lessons ---
export const createLesson = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { title, content, fileType, order } = req.body;
    
    let videoUrl = req.body.videoUrl || null;
    let pdfUrl = req.body.pdfUrl || null;

    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;
      if (fileType === 'PDF') {
        pdfUrl = filePath;
      } else if (fileType === 'VIDEO') {
        videoUrl = filePath;
      }
    }

    const lesson = await prisma.lesson.create({
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating lesson', error: error.message });
  }
};

// --- Student Enrollments ---
export const enrollInCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Free courses can be joined instantly. Paid courses require payment.
    if (course.price > 0) {
      return res.status(402).json({ message: 'Payment required for this course', price: course.price });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error: any) {
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
};

// --- Progress ---
export const getProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId } = req.params;

    const progress = await prisma.userProgress.findMany({
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};

export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lessonId } = req.params;
    const { completed } = req.body; // boolean

    const progress = await prisma.userProgress.upsert({
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating lesson progress', error: error.message });
  }
};
