import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Columns, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface PdfReaderProps {
  pdfUrl: string;
  lessonTitle: string;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function PdfReader({ pdfUrl, lessonTitle, onComplete, isCompleted }: PdfReaderProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [showSidebar, setShowSidebar] = useState(true);
  const [secondsRead, setSecondsRead] = useState(0);

  // Auto-track reading time duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRead((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format reading seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 80));

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleFullscreen = () => {
    const viewerElement = document.getElementById('pdf-document-viewer');
    if (viewerElement) {
      if (!document.fullscreenElement) {
        viewerElement.requestFullscreen().catch((err) => {
          console.error(`Error enabling fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 font-sans">
      {/* Controls Bar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors ${
              showSidebar ? 'bg-primary/5 text-primary' : ''
            }`}
            title="Toggle Outline"
          >
            <Columns size={16} />
          </button>
          <span className="font-bold text-xs md:text-sm line-clamp-1">{lessonTitle}</span>
        </div>

        {/* Center zoom & pagination controls */}
        <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="hover:text-primary disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="hover:text-primary disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
          
          <div className="h-4 w-px bg-border mx-1" />

          <button onClick={handleZoomOut} className="hover:text-primary"><ZoomOut size={14} /></button>
          <span className="w-8 text-center">{zoom}%</span>
          <button onClick={handleZoomIn} className="hover:text-primary"><ZoomIn size={14} /></button>
        </div>

        {/* Fullscreen & Completed checks */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded-lg">
            Time: {formatTime(secondsRead)}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="Fullscreen Mode"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={onComplete}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'bg-primary text-white hover:bg-primary/95'
            }`}
          >
            {isCompleted ? <Check size={14} /> : null}
            <span>{isCompleted ? 'Finished' : 'Mark Read'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Outline Index */}
        {showSidebar && (
          <aside className="w-56 border-r border-border bg-card overflow-y-auto flex-shrink-0 animate-in slide-in-from-left duration-200">
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Document Sections</span>
              <div className="space-y-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold ${
                      currentPage === i + 1
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>Page {i + 1}</span>
                    <span className="text-[9px] text-muted-foreground">Section {i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Simulated Document Viewer */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6" id="pdf-document-viewer">
          <div
            className="bg-white text-slate-800 border border-border p-10 rounded-2xl shadow-lg relative flex flex-col justify-between"
            style={{
              width: `${zoom * 5.5}px`,
              minHeight: `${zoom * 7}px`,
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <span>WAEC Study Notes</span>
                <span>Page {currentPage}</span>
              </div>
              
              {/* Page Content Simulator */}
              {currentPage === 1 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">Syllabus Overview & Mechanics</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Mechanics is the branch of physics dealing with the motion of bodies under the action of forces. This includes Newtonian Mechanics, kinematics, and dynamics.
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    For examinations like WAEC and UTME, physics calculations are heavily focused on linear equations of motion, force equilibrium, Newton's Laws, and work/power relations.
                  </p>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 leading-relaxed font-semibold">
                    Formula constant reference: acceleration due to gravity (g) is approximated as 10 m/s².
                  </div>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">Equations of Motion (Formulas)</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Linear equations of motion represent relationships between displacement, initial/final velocity, acceleration, and time elapsed.
                  </p>
                  <ul className="list-decimal pl-4 text-xs text-slate-600 space-y-1.5">
                    <li><strong>v = u + at</strong>: Relates velocity and time. Used when displacement is unknown.</li>
                    <li><strong>s = ut + 0.5 * at²</strong>: Used when final velocity is unknown.</li>
                    <li><strong>v² = u² + 2as</strong>: Used when time is unknown.</li>
                  </ul>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Always confirm direction of motion. If moving upwards against gravity, replace acceleration <em>a</em> with <em>-g</em>.
                  </p>
                </div>
              )}

              {currentPage >= 3 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">Worked Practice Exercise</h3>
                  <p className="text-xs leading-relaxed text-slate-600 font-semibold">
                    Question: An object of mass 4 kg is projected vertically upwards with a speed of 30 m/s. What is its potential energy at maximum height?
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    <strong>Solution Steps:</strong><br/>
                    1. At maximum height, final velocity v = 0.<br/>
                    2. Use equation: v² = u² - 2gh {'=>'} 0 = 30² - 2(10)h {'=>'} 20h = 900 {'=>'} h = 45 meters.<br/>
                    3. Calculate Potential Energy: PE = mgh = 4 * 10 * 45 = 1800 Joules.
                  </p>
                  <p className="text-xs text-slate-400 mt-6 text-center">--- End of Section ---</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-semibold">
              Brains Lab Academy • WAEC / UTME Study System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
