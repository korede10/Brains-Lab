import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getAdminAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });
    const totalCourses = await prisma.course.count();
    
    const successfulPayments = await prisma.transaction.findMany({
      where: { status: 'SUCCESSFUL' },
      select: { amount: true },
    });
    
    const totalRevenue = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);

    const totalAttempts = await prisma.examAttempt.count();
    const passedAttempts = await prisma.examAttempt.count({ where: { isPassed: true } });
    
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const recentTransactions = await prisma.transaction.findMany({
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching admin analytics', error: error.message });
  }
};

export const getStudentAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const enrollmentsCount = await prisma.enrollment.count({ where: { userId } });
    const certificatesCount = await prisma.certificate.count({ where: { userId } });
    
    const attempts = await prisma.examAttempt.findMany({
      where: { userId },
      include: {
        assessment: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const completedProgressCount = await prisma.userProgress.count({
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching student analytics', error: error.message });
  }
};
