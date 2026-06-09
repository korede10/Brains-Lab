import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Mock gateway endpoints to simulate live payment responses
export const initializePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { courseId, gateway } = req.body; // 'PAYSTACK' or 'FLUTTERWAVE'

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const reference = `LMS-${gateway === 'PAYSTACK' ? 'PSTK' : 'FLWV'}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    const transaction = await prisma.transaction.create({
      data: {
        reference,
        userId,
        courseId,
        amount: course.price,
        gateway: gateway === 'FLUTTERWAVE' ? 'FLUTTERWAVE' : 'PAYSTACK',
        status: 'PENDING',
      },
    });

    // In a live integration, we would POST to Paystack/Flutterwave APIs to initialize checkout
    // For sandbox verification, we provide the reference and mock redirect URLs.
    res.json({
      message: 'Payment initialized',
      reference,
      amount: course.price,
      email: req.user!.email,
      authorizationUrl: `https://checkout.sandbox.gateway.com/pay/${reference}`, // Sandbox mock URL
      transaction,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error initializing payment', error: error.message });
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reference } = req.params;
    const { status } = req.query; // Sandbox simulator passes status: 'SUCCESSFUL' or 'FAILED'

    const transaction = await prisma.transaction.findUnique({
      where: { reference },
      include: { course: true, user: true },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.json({
        message: 'Payment already processed',
        transaction,
      });
    }

    // In a live system, we would query the Paystack (https://api.paystack.co/transaction/verify/:reference)
    // or Flutterwave (https://api.flutterwave.com/v3/transactions/:id/verify) endpoint with headers containing API Keys.
    // For sandbox validation, we allow simulating successes.
    const finalStatus = status === 'FAILED' ? 'FAILED' : 'SUCCESSFUL';

    const updatedTransaction = await prisma.transaction.update({
      where: { reference },
      data: { status: finalStatus },
    });

    if (finalStatus === 'SUCCESSFUL') {
      // Create Enrollment
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: transaction.userId,
            courseId: transaction.courseId,
          },
        },
        update: {},
        create: {
          userId: transaction.userId,
          courseId: transaction.courseId,
        },
      });

      // Send a notification
      await prisma.notification.create({
        data: {
          userId: transaction.userId,
          title: 'Payment Successful',
          message: `Your payment of NGN ${transaction.amount} for "${transaction.course.title}" was verified successfully. You are now enrolled!`,
        },
      });
    }

    res.json({
      message: finalStatus === 'SUCCESSFUL' ? 'Payment verified successfully' : 'Payment failed',
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};
