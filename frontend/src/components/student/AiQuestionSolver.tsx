import React, { useState } from 'react';
import { Brain, Sparkles, Send, HelpCircle, Loader2 } from 'lucide-react';

interface AiQuestionSolverProps {
  token: string;
}

export default function AiQuestionSolver({ token }: AiQuestionSolverProps) {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<any>(null);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setSolution(null);

    try {
      const response = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, subject }),
      });

      const data = await response.json();
      setSolution(data.solution);
    } catch (error) {
      console.error('AI Solver failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Question Solver</h1>
        <p className="text-sm text-muted-foreground mt-1">Get instant step-by-step solutions for WAEC & UTME science questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
            <span className="font-bold text-xs text-primary uppercase tracking-wider block flex items-center gap-1">
              <Sparkles size={14} />
              <span>Solve Engine</span>
            </span>

            <form onSubmit={handleSolve} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Science Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Paste Question Text</label>
                <textarea
                  required
                  placeholder="e.g. Calculate the pH of a 0.01M hydrochloric acid solution..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  className="w-full p-3.5 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Analyzing Problem...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Get Solution</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="p-4 rounded-xl border border-dashed bg-muted/15 border-border text-[10px] text-muted-foreground space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1">
              <HelpCircle size={14} />
              <span>Sample calculation prompts:</span>
            </span>
            <ul className="list-disc pl-3.5 space-y-1">
              <li>"Calculate final velocity of a car that starts from rest with 5m/s² acceleration for 10 seconds."</li>
              <li>"Solve for the molecular weight of H2SO4."</li>
              <li>"What are the light stages of photosynthesis?"</li>
            </ul>
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-card border border-border p-6 md:p-8 rounded-3xl min-h-[300px] flex flex-col justify-between relative shadow-sm">
            {solution ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Brain className="text-primary" size={20} />
                  <div>
                    <h3 className="font-bold text-sm">Step-by-Step Breakdown</h3>
                    <span className="text-[9px] text-muted-foreground block">Source: {solution.source || 'AI Engine'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-[10px] text-primary uppercase block tracking-wider">Concept Summary</span>
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">{solution.explanation}</p>
                  </div>

                  <div className="space-y-2.5">
                    <span className="font-bold text-[10px] text-secondary uppercase block tracking-wider">Workings & Equations</span>
                    <div className="space-y-2 pl-3 border-l border-primary/20">
                      {solution.steps?.map((step: string, i: number) => (
                        <div key={i} className="flex gap-2.5 items-start text-xs leading-relaxed text-muted-foreground">
                          <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 whitespace-pre-line">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 text-[10px] text-muted-foreground text-center font-mono">
                  • Always review formulas to ensure UTME speed standards.
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16 text-center">
                <Brain className="text-muted-foreground/30 mb-3" size={40} />
                <span className="font-bold text-slate-700 dark:text-slate-300">Solution Board</span>
                <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                  Enter your biology, chemistry, math, or physics question on the left to see the step-by-step workings panel.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
