import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HomeProps {
  user: any;
  onNavigate: (view: string, params?: any) => void;
  courses: any[];
  onEnroll: (courseId: string) => void;
  onOpenPayment: (courseId: string) => void;
}

export default function Home({ user, onNavigate, courses, onEnroll, onOpenPayment }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'ALL' ? true : filter === 'FREE' ? course.price === 0 : course.price > 0;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden rounded-b-[2rem] border-b border-indigo-500/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            WAEC & UTME Sciences 2026 Session
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
            Ace Your Science Exams <br/>
            <span className="text-gradient">With Conceptual Clarity.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Take official CBT exam prep, practice with offline tests, and get step-by-step answers from our AI Solver instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate(user ? 'STUDENT_DASHBOARD' : 'REGISTER')}
              className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('AI_SOLVER')}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl backdrop-blur-md border border-white/10 transition-all"
            >
              Ask AI Question Solver
            </button>
          </div>
        </div>
      </section>

      {/* Courses Catalog Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Browse Science Prep Courses</h2>
            <p className="text-sm text-muted-foreground mt-1">Curated materials matching current WAEC & UTME syllabi.</p>
          </div>

          {/* Search and Filter controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center rounded-xl border border-input p-0.5 bg-card text-xs font-semibold">
              {(['ALL', 'FREE', 'PAID'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filter === type ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                {/* Course Cover */}
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  <img
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold bg-card shadow-sm">
                    {course.price === 0 ? (
                      <span className="text-emerald-500">FREE</span>
                    ) : (
                      <span className="text-indigo-500 font-bold">₦{course.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Course Details */}
                <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <BookOpen size={14} />
                      <span>Science Prep</span>
                    </div>

                    {user ? (
                      <button
                        onClick={() => {
                          if (course.price === 0) {
                            onEnroll(course.id);
                          } else {
                            onOpenPayment(course.id);
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl shadow hover:bg-primary/95 transition-all"
                      >
                        {course.price === 0 ? 'Study Now' : 'Unlock Course'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('LOGIN')}
                        className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/15 transition-all"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <BookOpen className="mx-auto text-muted-foreground mb-3" size={32} />
              <span className="block font-bold text-slate-700 dark:text-slate-300">No courses match your search</span>
              <p className="text-xs text-muted-foreground mt-1">Try resetting the filters or typing a different keyword.</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto bg-muted/30 rounded-[2rem] border border-border">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Engineered for WAEC & UTME Success</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Brains Lab LMS integrates advanced visual and operational features to guarantee an optimal learning outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-primary font-bold">1</div>
            <h3 className="font-bold">Offline Practice Tests</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download practice tests directly onto your device. Take them completely offline while traveling, and get instant corrections and detailed chemistry/physics breakdown steps.
            </p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold">2</div>
            <h3 className="font-bold">Online CBT Examination</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Practice under real examination conditions. Fullscreen lock, active focus loss monitoring, auto-submit countdowns, and official West African exam grading templates.
            </p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">3</div>
            <h3 className="font-bold">AI Science Helper</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stuck on a tricky calculation? Input any WAEC/UTME science question and get a structured, step-by-step breakdown using the Gemini-backed AI solver.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
