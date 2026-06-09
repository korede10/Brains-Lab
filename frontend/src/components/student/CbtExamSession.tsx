/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Timer, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';

interface CbtExamSessionProps {
  token: string;
  examId: string;
  onNavigate: (view: string) => void;
}

export default function CbtExamSession({ token, examId, onNavigate }: CbtExamSessionProps) {
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Answers state: questionId -> optionKey ('A', 'B', 'C', 'D')
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  
  // Flags & Anti-cheating
  const [cheatAlerts, setCheatAlerts] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResults, setAttemptResults] = useState<any>(null);

  // Load Exam and start attempt
  useEffect(() => {
    const initExam = async () => {
      try {
        const response = await fetch(`/api/assessments/${examId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examData = await response.json();
        setExam(examData);
        
        // Start an attempt in DB
        const attRes = await fetch(`/api/assessments/${examId}/attempts`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const attData = await attRes.json();
        setAttempt(attData);

        // Calculate time left from attempt start and duration
        const durationSeconds = examData.durationMinutes * 60;
        setTimeLeft(durationSeconds);
      } catch (error) {
        console.error('Error starting CBT session', error);
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, token]);

  // Anti-cheating focus change triggers
  useEffect(() => {
    if (attemptResults || loading || !exam) return;

    const handleWindowBlur = () => {
      setCheatAlerts((prev: number) => {
        const newCount = prev + 1;
        setShowCheatWarning(true);
        return newCount;
      });
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [attemptResults, loading, exam]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0 || attemptResults || loading) {
      if (timeLeft === 0 && attempt && !attemptResults) {
        handleAutoSubmit();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, attemptResults, loading]);

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionKey,
    });
  };

  const handleToggleFlag = (questionId: string) => {
    if (flaggedQuestions.includes(questionId)) {
      setFlaggedQuestions(flaggedQuestions.filter((id: string) => id !== questionId));
    } else {
      setFlaggedQuestions([...flaggedQuestions, questionId]);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !confirm('Are you sure you want to submit your CBT exam?')) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          cheatAlertsCount: cheatAlerts,
        }),
      });

      const data = await response.json();
      setAttemptResults(data);
    } catch (error) {
      console.error('Error submitting exam', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Render Post-Exam Results Screen if submitted
  if (attemptResults) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-10 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
        <div className="bg-card p-8 rounded-3xl border border-border text-center space-y-4 shadow-xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-secondary" />

          <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">CBT Exam Submitted</h1>
            <p className="text-xs text-muted-foreground mt-1">Your answers have been graded. Here is your scorecard.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 max-w-md mx-auto">
            <div className="bg-muted/30 p-3 rounded-2xl border border-border">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Final Score</span>
              <span className="text-2xl font-extrabold text-gradient">{attemptResults.attempt.score.toFixed(1)}%</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-2xl border border-border">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Correct Answers</span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{attemptResults.attempt.correctAnswers} / {attemptResults.attempt.totalQuestions}</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-2xl border border-border">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</span>
              <span className={`text-sm font-extrabold block mt-2 ${
                attemptResults.attempt.isPassed ? 'text-emerald-500' : 'text-destructive'
              }`}>{attemptResults.attempt.isPassed ? 'PASSED' : 'FAILED'}</span>
            </div>
          </div>

          {attemptResults.attempt.cheatAlertsCount > 0 && (
            <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/15 text-xs text-destructive max-w-md mx-auto flex items-center justify-center gap-2">
              <ShieldAlert size={16} />
              <span>We detected <strong>{attemptResults.attempt.cheatAlertsCount}</strong> event(s) of tab switching/focus loss.</span>
            </div>
          )}

          <button
            onClick={() => onNavigate('STUDENT_DASHBOARD')}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary/95 transition-all text-xs"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Review Questions & Explanations</h2>
          <div className="space-y-4">
            {attemptResults.review?.map((q: any, i: number) => {
              const isCorrect = q.selectedAnswer === q.correctAnswer;
              return (
                <div key={q.id} className="bg-card p-5 rounded-2xl border border-border space-y-3 shadow-sm">
                  <span className="font-bold text-xs text-muted-foreground">Question {i + 1}</span>
                  <p className="font-semibold text-sm leading-relaxed">{q.questionText}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border ${q.correctAnswer === 'A' ? 'border-emerald-500 bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-400' : q.selectedAnswer === 'A' ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                      A. {q.optionA}
                    </div>
                    <div className={`p-2.5 rounded-xl border ${q.correctAnswer === 'B' ? 'border-emerald-500 bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-400' : q.selectedAnswer === 'B' ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                      B. {q.optionB}
                    </div>
                    <div className={`p-2.5 rounded-xl border ${q.correctAnswer === 'C' ? 'border-emerald-500 bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-400' : q.selectedAnswer === 'C' ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                      C. {q.optionC}
                    </div>
                    <div className={`p-2.5 rounded-xl border ${q.correctAnswer === 'D' ? 'border-emerald-500 bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-400' : q.selectedAnswer === 'D' ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                      D. {q.optionD}
                    </div>
                  </div>

                  <div className="mt-3 p-3.5 bg-muted/30 border border-border rounded-xl space-y-1">
                    <span className="font-bold text-[10px] text-primary block uppercase">Academic Explanation:</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation || 'No explanation curated.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active exam session UI
  const questions = exam?.questions || [];
  const activeQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Anti-Cheating Alert Modal */}
      {showCheatWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border max-w-sm w-full p-6 rounded-3xl text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <ShieldAlert className="mx-auto text-destructive" size={48} />
            <h3 className="font-extrabold text-lg">CBT Security Warning</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Brains Lab CBT Exam system enforces active monitoring. Navigating away from this tab or losing window focus is logged as a violation.
            </p>
            <button
              onClick={() => setShowCheatWarning(false)}
              className="w-full py-2 bg-destructive text-white font-bold text-xs rounded-xl shadow hover:bg-destructive/90 transition-all"
            >
              Resume CBT Session
            </button>
          </div>
        </div>
      )}

      {/* CBT Header */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-10 flex-shrink-0">
        <div>
          <span className="text-xs font-bold text-red-500 tracking-wide uppercase flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            ONLINE EXAM ACTIVE
          </span>
          <h1 className="font-bold text-sm md:text-base line-clamp-1">{exam?.title}</h1>
        </div>

        {/* Timer Card */}
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 font-extrabold text-sm font-mono">
          <Timer size={16} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-primary/95 transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

      {/* CBT Core workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Question Viewer */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeQuestion ? (
            <div className="max-w-3xl mx-auto space-y-6 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <button
                  onClick={() => handleToggleFlag(activeQuestion.id)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    flaggedQuestions.includes(activeQuestion.id)
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-600'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Flag for Review
                </button>
              </div>

              <p className="font-bold text-base md:text-lg leading-relaxed text-slate-800 dark:text-slate-100">
                {activeQuestion.questionText}
              </p>

              {/* Multiple choice selections */}
              <div className="space-y-3 pt-2">
                {['A', 'B', 'C', 'D'].map((key) => {
                  const optionText = key === 'A' ? activeQuestion.optionA : key === 'B' ? activeQuestion.optionB : key === 'C' ? activeQuestion.optionC : activeQuestion.optionD;
                  const isSelected = answers[activeQuestion.id] === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(activeQuestion.id, key)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left text-xs md:text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border hover:bg-muted/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {key}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No questions curated for this exam package.
            </div>
          )}

          {/* Navigation keys */}
          <div className="max-w-3xl mx-auto flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentQuestionIndex((prev: number) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-border text-xs font-bold rounded-xl hover:bg-muted transition-all flex items-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentQuestionIndex((prev: number) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-4 py-2 border border-border text-xs font-bold rounded-xl hover:bg-muted transition-all flex items-center gap-1 disabled:opacity-30"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* Right Side Question Grid Palette */}
        <aside className="hidden lg:block w-72 border-l border-border bg-card p-5 overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Question Palette</span>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q: any, i: number) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = flaggedQuestions.includes(q.id);
                const isActive = currentQuestionIndex === i;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`h-10 rounded-xl text-xs font-bold border flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-primary ring-2 ring-primary/20 text-primary'
                        : isFlagged
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                        : isAnswered
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-[10px] text-muted-foreground font-semibold">
              <span className="block font-bold text-slate-700 dark:text-slate-300">Legend</span>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-emerald-500 inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded border border-amber-500 bg-amber-500/10 inline-block" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded border border-primary inline-block" />
                <span>Active Question</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
