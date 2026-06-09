import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// --- CBT Assessment Creation ---
export const createAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, type, durationMinutes, passingScore, isPublished, courseId } = req.body;

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type: type === 'EXAM' ? 'EXAM' : 'PRACTICE',
        durationMinutes: parseInt(durationMinutes) || 45,
        passingScore: parseFloat(passingScore) || 50.0,
        isPublished: isPublished === true || isPublished === 'true',
        courseId,
      },
    });

    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating assessment', error: error.message });
  }
};

export const addQuestionToAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation, courseId } = req.body;

    const question = await prisma.question.create({
      data: {
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer, // 'A', 'B', 'C', 'D'
        explanation,
        courseId,
        assessmentId: assessmentId || null,
      },
    });

    res.status(201).json(question);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding question', error: error.message });
  }
};

// --- CBT Exam / Practice execution ---
export const getAssessmentQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            // Exclude correctAnswer and explanation to prevent cheating for online EXAMs!
            // However, for PRACTICE tests, we might allow it, but we can send it or grade on server.
            // Let's exclude correctAnswer from exam load, but keep it for practice details after submission.
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching assessment questions', error: error.message });
  }
};

export const startAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { assessmentId } = req.params;

    // Check if there's already an active unsubmitted attempt for this exam
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId,
        assessmentId,
        isSubmitted: false,
      },
    });

    if (activeAttempt) {
      return res.json(activeAttempt);
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        assessmentId,
        totalQuestions: assessment.questions.length,
        startedAt: new Date(),
      },
    });

    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(500).json({ message: 'Error starting attempt', error: error.message });
  }
};

export const submitAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // attemptId
    const { answers, cheatAlertsCount } = req.body; // Map of questionId -> selectedOption ('A','B','C','D')

    const attempt = await prisma.examAttempt.findUnique({
      where: { id },
      include: {
        assessment: {
          include: {
            questions: true,
            course: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({ message: 'Attempt has already been submitted' });
    }

    const questions = attempt.assessment.questions;
    let correctAnswers = 0;

    questions.forEach((q: any) => {
      const selected = answers[q.id];
      if (selected === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    const isPassed = score >= attempt.assessment.passingScore;

    const updatedAttempt = await prisma.examAttempt.update({
      where: { id },
      data: {
        score,
        correctAnswers,
        isSubmitted: true,
        isPassed,
        cheatAlertsCount: parseInt(cheatAlertsCount) || 0,
        endedAt: new Date(),
      },
    });

    // If student passed and this is a course assessment, check if they should receive a certificate!
    if (isPassed) {
      // Create a Certificate automatically if they complete a course's exam.
      // We will check if one exists already to avoid duplicates.
      const existingCert = await prisma.certificate.findFirst({
        where: {
          userId: attempt.userId,
          courseId: attempt.assessment.courseId,
        },
      });

      if (!existingCert) {
        const certCode = `CERT-${attempt.assessment.course.title.replace(/\s+/g, '-').toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await prisma.certificate.create({
          data: {
            certificateCode: certCode,
            userId: attempt.userId,
            courseId: attempt.assessment.courseId,
          },
        });
      }
    }

    // Prepare full results with question explanations so the user can review
    res.json({
      attempt: updatedAttempt,
      review: questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        selectedAnswer: answers[q.id] || null,
        explanation: q.explanation,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting attempt', error: error.message });
  }
};

export const getAttempts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const attempts = await prisma.examAttempt.findMany({
      where: { userId },
      include: {
        assessment: {
          include: { course: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving attempts', error: error.message });
  }
};
