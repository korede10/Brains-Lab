import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FileText, CreditCard, PlusCircle, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

interface AdminDashboardProps {
  token: string;
  onNavigate: (view: string, params?: any) => void;
  courses: any[];
  onRefreshCourses: () => void;
}

export default function AdminDashboard({ token, onNavigate, courses, onRefreshCourses }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'COURSES' | 'CBT' | 'TRANSACTIONS'>('ANALYTICS');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Modules
  const [moduleTitle, setModuleTitle] = useState('');
  
  // Lessons
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonType, setLessonType] = useState<'ARTICLE' | 'PDF' | 'VIDEO'>('ARTICLE');

  // CBT Exam Creation
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<'EXAM' | 'PRACTICE'>('PRACTICE');
  const [examDuration, setExamDuration] = useState('30');
  const [examPassing, setExamPassing] = useState('50');

  // Question Creation
  const [selectedExamId, setSelectedExamId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctKey, setCorrectKey] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching admin dashboard analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, activeTab]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDesc,
          price: coursePrice,
          isPublished: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to create course');

      setMessage('Course created successfully!');
      setCourseTitle('');
      setCourseDesc('');
      setCoursePrice('');
      onRefreshCourses();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedCourseId) return setMessage('Please select a course');

    try {
      const response = await fetch(`/api/courses/${selectedCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: moduleTitle,
          order: 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to create module');

      setMessage('Module created successfully!');
      setModuleTitle('');
      onRefreshCourses();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedModuleId) return setMessage('Please select a module');

    try {
      const response = await fetch(`/api/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: lessonTitle,
          content: lessonContent,
          fileType: lessonType,
          order: 1,
          videoUrl: lessonType === 'VIDEO' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null,
          pdfUrl: lessonType === 'PDF' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create lesson');

      setMessage('Lesson created successfully!');
      setLessonTitle('');
      setLessonContent('');
      onRefreshCourses();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedCourseId) return setMessage('Please select a course');

    try {
      const response = await fetch(`/api/courses/${selectedCourseId}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: examTitle,
          type: examType,
          durationMinutes: examDuration,
          passingScore: examPassing,
          isPublished: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to create assessment');

      setMessage('Assessment created successfully!');
      setExamTitle('');
      onRefreshCourses();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedExamId || !selectedCourseId) return setMessage('Select Course & Assessment');

    try {
      const response = await fetch(`/api/assessments/${selectedExamId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionText,
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD,
          correctAnswer: correctKey,
          explanation,
          courseId: selectedCourseId,
        }),
      });

      if (!response.ok) throw new Error('Failed to add question');

      setMessage('Question curated successfully!');
      setQuestionText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setExplanation('');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefreshCourses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage science courses, curriculum nodes, payments, and curations.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center rounded-xl border border-border p-1 bg-card text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'ANALYTICS' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('COURSES')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'COURSES' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen size={14} />
            <span>Curriculum Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('CBT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'CBT' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText size={14} />
            <span>CBT Curation</span>
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'TRANSACTIONS' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard size={14} />
            <span>Payments History</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-primary flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Analytics Overview Tab */}
      {activeTab === 'ANALYTICS' && !loading && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded-2xl border border-border">
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Students</span>
              <span className="text-3xl font-extrabold block mt-1">{analytics?.summary?.totalStudents || 0}</span>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-border">
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Science Courses</span>
              <span className="text-3xl font-extrabold block mt-1">{analytics?.summary?.totalCourses || 0}</span>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-border">
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Gross Revenue</span>
              <span className="text-3xl font-extrabold text-gradient block mt-1">₦{(analytics?.summary?.totalRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-border">
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">CBT Pass Rate</span>
              <span className="text-3xl font-extrabold text-emerald-500 block mt-1">{(analytics?.summary?.passRate || 0).toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enrollments */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-base">Recent Enrollments</h3>
              <div className="space-y-3">
                {analytics?.recentEnrollments && analytics.recentEnrollments.length > 0 ? (
                  analytics.recentEnrollments.map((en: any) => (
                    <div key={en.id} className="p-3 rounded-xl border border-border bg-muted/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block">{en.user.name}</span>
                        <span className="text-muted-foreground block text-[10px]">{en.user.email}</span>
                      </div>
                      <span className="font-semibold text-primary">{en.course.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No recent enrollments logged.</p>
                )}
              </div>
            </div>

            {/* Recent Payments logs */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-base">Recent Sales</h3>
              <div className="space-y-3">
                {analytics?.recentTransactions && analytics.recentTransactions.length > 0 ? (
                  analytics.recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="p-3 rounded-xl border border-border bg-muted/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block">{tx.user.name}</span>
                        <span className="text-muted-foreground block text-[10px]">{tx.reference}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gradient block">₦{tx.amount.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold ${
                          tx.status === 'SUCCESSFUL' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>{tx.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No sales reported.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Course Builder Tab */}
      {activeTab === 'COURSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Create Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Course */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PlusCircle className="text-primary" size={18} />
                <span>Create Science Prep Course</span>
              </h3>
              <form onSubmit={handleCreateCourse} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Course Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTME Science Prep: Physics"
                      value={courseTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourseTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Price (NGN) - 0 for Free</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2000"
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Syllabus Overview / Description</label>
                  <textarea
                    required
                    placeholder="Provide overview details..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow">
                  Create Course
                </button>
              </form>
            </div>

            {/* Create Modules & Lessons */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <PlusCircle className="text-secondary" size={18} />
                  <span>Build Syllabus Modules & Lessons</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Select a course, add chapters (modules), and populate lessons (lectures, articles, PDFs).</p>
              </div>

              {/* Module Form */}
              <form onSubmit={handleCreateModule} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                <span className="font-bold text-xs block text-secondary">Step 1: Add Syllabus Module (Chapter)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Module Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Module 1: Electromagnetism"
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow hover:bg-secondary/95">
                  Add Module
                </button>
              </form>

              {/* Lesson Form */}
              <form onSubmit={handleCreateLesson} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                <span className="font-bold text-xs block text-primary">Step 2: Add Lesson / Study Material (Lectures)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Module</label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="">-- Select Module --</option>
                      {courses.find(c => c.id === selectedCourseId)?.modules?.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      )) || (
                        <option value="">Choose course first</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Lesson Type</label>
                    <select
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="ARTICLE">Article (Markdown)</option>
                      <option value="PDF">PDF Reading Mode (Upload Ref)</option>
                      <option value="VIDEO">Video Lecture (mp4/stream)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Lesson Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Newton's Third Law of Motion"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Lesson Content (Markdown Supported)</label>
                  <textarea
                    required={lessonType === 'ARTICLE'}
                    placeholder="Write article details..."
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-card border border-border rounded-xl text-[10px] text-muted-foreground">
                  <span className="font-bold text-primary block">Lesson File Handling:</span>
                  PDF and Video paths will be configured with fallback local resources automatically.
                </div>

                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow hover:bg-primary/95">
                  Add Lesson
                </button>
              </form>
            </div>
          </div>

          {/* Active Curriculum Sidebar view */}
          <div className="space-y-4">
            <h3 className="font-bold text-base">Current Courses</h3>
            <div className="space-y-4">
              {courses.map((c) => (
                <div key={c.id} className="bg-card p-4 rounded-xl border border-border flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs">{c.title}</h4>
                    <span className="text-[10px] text-primary font-bold mt-1 block">₦{c.price.toLocaleString()}</span>
                    
                    {/* List modules and lessons */}
                    <div className="mt-2 pl-2 border-l border-border space-y-1.5 text-[10px]">
                      {c.modules?.map((m: any) => (
                        <div key={m.id}>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{m.title}</span>
                          <ul className="pl-2 list-disc text-muted-foreground">
                            {m.lessons?.map((les: any) => (
                              <li key={les.id}>{les.title} ({les.fileType})</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CBT Assessments Curation Tab */}
      {activeTab === 'CBT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-6">
            {/* Create Assessment Form */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PlusCircle className="text-primary" size={18} />
                <span>Create Assessment CBT Package</span>
              </h3>
              <form onSubmit={handleCreateExam} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Assessment Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics Force CBT Exam"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="PRACTICE">Practice (Offline-ready)</option>
                      <option value="EXAM">CBT Exam (Online-only)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      value={examDuration}
                      onChange={(e) => setExamDuration(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Passing Score (%)</label>
                    <input
                      type="number"
                      required
                      value={examPassing}
                      onChange={(e) => setExamPassing(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card"
                    />
                  </div>
                </div>

                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow hover:bg-primary/95">
                  Create CBT Assessment
                </button>
              </form>
            </div>

            {/* Curate Question Form */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PlusCircle className="text-secondary" size={18} />
                <span>Curate Multiple Choice Question</span>
              </h3>
              <form onSubmit={handleAddQuestion} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Course (curation reference)</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Assessment Package</label>
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="">-- Select Assessment --</option>
                      {courses.find(c => c.id === selectedCourseId)?.assessments?.map((as: any) => (
                        <option key={as.id} value={as.id}>{as.title} ({as.type})</option>
                      )) || (
                        <option value="">Select Course first</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Question text</label>
                  <textarea
                    required
                    placeholder="Input question..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Option A</label>
                    <input type="text" required value={optA} onChange={(e) => setOptA(e.target.value)} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Option B</label>
                    <input type="text" required value={optB} onChange={(e) => setOptB(e.target.value)} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Option C</label>
                    <input type="text" required value={optC} onChange={(e) => setOptC(e.target.value)} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Option D</label>
                    <input type="text" required value={optD} onChange={(e) => setOptD(e.target.value)} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Correct Answer Key</label>
                    <select
                      value={correctKey}
                      onChange={(e) => setCorrectKey(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Step-by-Step Science Explanation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Using equation F = ma, 10kg * 10m/s = 100N"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card"
                    />
                  </div>
                </div>

                <button type="submit" className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl shadow hover:bg-secondary/95">
                  Curate Question
                </button>
              </form>
            </div>
          </div>

          {/* Active CBT Packages Sidebar list */}
          <div className="space-y-4">
            <h3 className="font-bold text-base">CBT & Practice Packages</h3>
            <div className="space-y-4">
              {courses.flatMap(c => c.assessments || []).map((as: any) => (
                <div key={as.id} className="bg-card p-4 rounded-xl border border-border">
                  <h4 className="font-bold text-xs">{as.title}</h4>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      as.type === 'EXAM' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'
                    }`}>{as.type}</span>
                    <span className="text-[9px] text-muted-foreground">{as.durationMinutes} mins | Passing: {as.passingScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions History Tab */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {analytics?.recentTransactions && analytics.recentTransactions.length > 0 ? (
                  analytics.recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold">{tx.reference}</td>
                      <td className="p-4">{tx.user.name}</td>
                      <td className="p-4 font-bold">{tx.course.title}</td>
                      <td className="p-4 font-bold text-gradient">₦{tx.amount.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{tx.gateway}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          tx.status === 'SUCCESSFUL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>{tx.status}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
