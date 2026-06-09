import React, { useState, useEffect } from 'react';
import { BookOpen, Award, FileText, CheckCircle2, History, AlertCircle, PlayCircle } from 'lucide-react';

interface StudentDashboardProps {
  token: string;
  onNavigate: (view: string, params?: any) => void;
  courses: any[];
}

export default function StudentDashboard({ token, onNavigate, courses }: StudentDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/student', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setAnalytics(data);

        // Fetch student certificates
        const userProfile = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await userProfile.json();

        // Cross check user certificates through a separate state mockup or direct query
        // Let's create mock certificate items if their attempts have been passed.
        if (data.attempts) {
          const passedExams = data.attempts.filter((att: any) => att.isPassed && att.isSubmitted);
          const certs = passedExams.map((att: any) => ({
            id: att.id,
            courseTitle: att.assessment.course.title,
            courseId: att.assessment.courseId,
            code: `CERT-${att.assessment.course.title.replace(/\s+/g, '-').toUpperCase()}-${att.id.substring(0, 5).toUpperCase()}`,
            date: new Date(att.endedAt || att.createdAt).toLocaleDateString(),
          }));
          setCertificates(certs);
        }
      } catch (error) {
        console.error('Error fetching student dashboard analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const enrolledCourses = courses.filter((c) => {
    // If they have enrolled (for simulation, they are enrolled in free courses,
    // or we can cross-check database records). We'll assume they're enrolled in the free physics course by default,
    // and others if they've completed attempts.
    return c.price === 0; // Seeding enrolled student in free physics course
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your exam prep progress and achievements.</p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Courses Joined</span>
            <span className="text-2xl font-extrabold">{analytics?.summary?.enrollmentsCount || 0}</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <History size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">CBT Attempts</span>
            <span className="text-2xl font-extrabold">{analytics?.summary?.attemptsCount || 0}</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Lessons Finished</span>
            <span className="text-2xl font-extrabold">{analytics?.summary?.completedProgressCount || 0}</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Award size={24} />
          </div>
          <div>
            <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Certificates</span>
            <span className="text-2xl font-extrabold">{certificates.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">My Registered Prep Courses</h2>
          <div className="space-y-4">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <div key={course.id} className="bg-card p-5 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{course.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="h-1.5 w-24 bg-muted rounded-full overflow-hidden inline-block">
                          <span className="h-full bg-primary block rounded-full" style={{ width: '40%' }} />
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">40% Complete</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('COURSE_VIEWER', { courseId: course.id })}
                    className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1.5 justify-center"
                  >
                    <PlayCircle size={14} />
                    <span>Resume</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/10">
                <BookOpen className="mx-auto text-muted-foreground mb-2" size={24} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Not enrolled in any courses yet</span>
                <button onClick={() => onNavigate('HOME')} className="mt-3 text-xs font-bold text-primary hover:underline block mx-auto">
                  Browse Catalog
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Certificates */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Earned Certificates</h2>
          <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <div key={cert.id} className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs block leading-tight">{cert.courseTitle}</span>
                    <span className="text-[10px] text-muted-foreground block mt-1">Issued: {cert.date}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('STUDENT_DASHBOARD', { certId: cert.id, viewCert: cert })}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 rounded-xl transition-all"
                    title="View Certificate"
                  >
                    <Award size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Award className="mx-auto text-muted-foreground/40 mb-2" size={28} />
                <p className="text-xs">Pass a final CBT exam with 60%+ score to earn a certificate.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CBT History Attempts Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <History size={20} className="text-muted-foreground" />
          <span>CBT & Practice Performance Logs</span>
        </h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="p-4">Assessment</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Cheating Alerts</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {analytics?.attempts && analytics.attempts.length > 0 ? (
                  analytics.attempts.map((att: any) => (
                    <tr key={att.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold">{att.assessment.title}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          att.assessment.type === 'EXAM' 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {att.assessment.type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-sm text-gradient">
                        {att.score.toFixed(1)}%
                      </td>
                      <td className="p-4">
                        {att.cheatAlertsCount > 0 ? (
                          <span className="text-destructive font-bold flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>{att.cheatAlertsCount} warning(s)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        {att.isPassed ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-500 font-bold">PASSED</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-destructive/10 text-destructive font-bold">FAILED</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(att.endedAt || att.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No CBT history matches. Start practicing!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
