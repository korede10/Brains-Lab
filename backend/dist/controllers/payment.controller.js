"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initializePayment = void 0;
const db_1 = __importDefault(require("../config/db"));
// Mock gateway endpoints to simulate live payment responses
const initializePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, gateway } = req.body; // 'PAYSTACK' or 'FLUTTERWAVE'
        const course = await db_1.default.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const reference = `LMS-${gateway === 'PAYSTACK' ? 'PSTK' : 'FLWV'}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
        const transaction = await db_1.default.transaction.create({
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
            email: req.user.email,
            authorizationUrl: `https://checkout.sandbox.gateway.com/pay/${reference}`, // Sandbox mock URL
            transaction,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error initializing payment', error: error.message });
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;
        const { status } = req.query; // Sandbox simulator passes status: 'SUCCESSFUL' or 'FAILED'
        const transaction = await db_1.default.transaction.findUnique({
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
        const updatedTransaction = await db_1.default.transaction.update({
            where: { reference },
            data: { status: finalStatus },
        });
        if (finalStatus === 'SUCCESSFUL') {
            // Create Enrollment
            await db_1.default.enrollment.upsert({
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
            await db_1.default.notification.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};
exports.verifyPayment = verifyPayment;
