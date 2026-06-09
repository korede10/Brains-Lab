import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, FileText, PlayCircle, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import PdfReader from '../components/student/PdfReader';

interface CourseViewerProps {
  token: string;
  courseId: string;
  onNavigate: (view: string, params?: any) => void;
}

export default function CourseViewer({ token, courseId, onNavigate }: CourseViewerProps) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Toggle active views (PDF Reader mode is active if lesson is PDF)
  const [showPdfReader, setShowPdfReader] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCourse(data);

        // Fetch user progress
        const progRes = await fetch(`/api/courses/${courseId}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const progData = await progRes.json();
        setCompletedLessons(progData.filter((p: any) => p.completed).map((p: any) => p.lessonId));

        // Set first lesson active by default
        if (data.modules?.[0]?.lessons?.[0]) {
          handleSelectLesson(data.modules[0].lessons[0]);
        }
      } catch (error) {
        console.error('Error fetching course', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  const handleSelectLesson = (lesson: any) => {
    setActiveLesson(lesson);
    if (lesson.fileType === 'PDF') {
      setShowPdfReader(true);
    } else {
      setShowPdfReader(false);
    }
  };

  const handleMarkComplete = async (lessonId: string) => {
    try {
      const isAlreadyCompleted = completedLessons.includes(lessonId);
      const newCompleted = isAlreadyCompleted
        ? completedLessons.filter((id) => id !== lessonId)
        : [...completedLessons, lessonId];

      setCompletedLessons(newCompleted);

      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !isAlreadyCompleted }),
      });
    } catch (error) {
      console.error('Error updating progress', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar - Course syllabus tree */}
      <aside className="w-full md:w-80 border-r border-border bg-card overflow-y-auto flex-shrink-0 flex flex-col justify-between">
        <div className="p-4 space-y-4">
          <button
            onClick={() => onNavigate('STUDENT_DASHBOARD')}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
          
          <div>
            <h2 className="font-bold text-base line-clamp-2 leading-tight">{course?.title}</h2>
            <span className="text-[10px] text-muted-foreground mt-1 block">Syllabus Chapters</span>
          </div>

          <div className="space-y-4 pt-2">
            {course?.modules?.map((mod: any) => (
              <div key={mod.id} className="space-y-1.5">
                <span className="font-bold text-xs uppercase text-muted-foreground tracking-wider block">{mod.title}</span>
                <div className="space-y-1">
                  {mod.lessons?.map((les: any) => {
                    const isActive = activeLesson?.id === les.id;
                    const isFinished = completedLessons.includes(les.id);
                    return (
                      <button
                        key={les.id}
                        onClick={() => handleSelectLesson(les)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                            : 'hover:bg-muted text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isFinished ? (
                          <CheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
                        ) : les.fileType === 'VIDEO' ? (
                          <PlayCircle className="text-muted-foreground flex-shrink-0" size={14} />
                        ) : (
                          <FileText className="text-muted-foreground flex-shrink-0" size={14} />
                        )}
                        <span className="line-clamp-1">{les.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments & Exams Curation */}
        <div className="p-4 border-t border-border bg-muted/10 space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Assessments</span>
          {course?.assessments?.map((as: any) => (
            <button
              key={as.id}
              onClick={() => {
                if (as.type === 'EXAM') {
                  onNavigate('CBT_EXAM', { examId: as.id });
                } else {
                  onNavigate('PRACTICE_TEST', { testId: as.id });
                }
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all text-center flex items-center justify-center gap-1.5 ${
                as.type === 'EXAM'
                  ? 'bg-red-500 hover:bg-red-600 shadow shadow-red-500/10'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow shadow-indigo-500/10'
              }`}
            >
              <span>Take {as.type === 'EXAM' ? 'CBT Exam' : 'Practice Test'}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        {showPdfReader && activeLesson?.pdfUrl ? (
          <PdfReader
            pdfUrl={activeLesson.pdfUrl}
            lessonTitle={activeLesson.title}
            onComplete={() => handleMarkComplete(activeLesson.id)}
            isCompleted={completedLessons.includes(activeLesson.id)}
          />
        ) : activeLesson ? (
          <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{activeLesson.title}</h1>
                <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded bg-indigo-500/10 text-primary text-[10px] font-bold uppercase">
                  {activeLesson.fileType} Lesson
                </span>
              </div>
              <button
                onClick={() => handleMarkComplete(activeLesson.id)}
                className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all ${
                  completedLessons.includes(activeLesson.id)
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {completedLessons.includes(activeLesson.id) ? 'Completed' : 'Mark Completed'}
              </button>
            </div>

            {/* Video Lesson Type */}
            {activeLesson.fileType === 'VIDEO' && activeLesson.videoUrl && (
              <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-border shadow-md">
                <video
                  src={activeLesson.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Article */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed space-y-4">
              {activeLesson.content ? (
                <div
                  className="whitespace-pre-line bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {activeLesson.content}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select a syllabus module or lesson to start studying.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-muted-foreground text-center">
            <BookOpen size={48} className="text-muted-foreground/30 mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Lesson Selected</h3>
            <p className="text-xs mt-1">Select a topic from the course outline sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
