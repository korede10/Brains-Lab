import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Shield, Loader2, X } from 'lucide-react';

interface PaymentGatewaysProps {
  token: string;
  courseId: string;
  courseTitle: string;
  price: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentGateways({ token, courseId, courseTitle, price, onSuccess, onClose }: PaymentGatewaysProps) {
  const [gateway, setGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Initialize payment on backend
      const initResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, gateway }),
      });

      const initData = await initResponse.json();
      if (!initResponse.ok) throw new Error(initData.message || 'Payment initialization failed');

      const reference = initData.reference;

      // Simulate payment processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Verify payment on backend
      const verifyResponse = await fetch(`/api/payments/verify/${reference}?status=SUCCESSFUL`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(verifyData.message || 'Payment verification failed');

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Transaction declined. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border w-full max-w-md p-6 rounded-3xl space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight">Checkout Payment</h2>
          <p className="text-xs text-muted-foreground">Unlock access to "{courseTitle}".</p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/25 text-xs text-destructive rounded-xl text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-250">
            <CheckCircle2 className="mx-auto text-emerald-500 animate-bounce" size={48} />
            <h3 className="font-extrabold text-base">Payment Verified!</h3>
            <p className="text-xs text-muted-foreground">Your enrollment details have been updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            {/* Gateway tab selection */}
            <div className="grid grid-cols-2 gap-2 p-1 border rounded-xl bg-muted/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => setGateway('PAYSTACK')}
                className={`py-2 rounded-lg transition-colors ${
                  gateway === 'PAYSTACK' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Paystack Gateway
              </button>
              <button
                type="button"
                onClick={() => setGateway('FLUTTERWAVE')}
                className={`py-2 rounded-lg transition-colors ${
                  gateway === 'FLUTTERWAVE' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Flutterwave Checkout
              </button>
            </div>

            {/* Credit Card simulator fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-input focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Total checkout info */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground">Amount Due:</span>
              <span className="text-gradient text-sm">₦{price.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Processing sandbox verification...</span>
                </>
              ) : (
                <>
                  <Shield size={14} />
                  <span>Pay ₦{price.toLocaleString()}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
