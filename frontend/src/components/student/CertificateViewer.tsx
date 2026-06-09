import React from 'react';
import { Award, Printer, X } from 'lucide-react';

interface CertificateViewerProps {
  certificate: {
    courseTitle: string;
    code: string;
    date: string;
  };
  onClose: () => void;
}

export default function CertificateViewer({ certificate, onClose }: CertificateViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border w-full max-w-4xl p-6 rounded-3xl space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-between border-b border-border pb-4 gap-4">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={24} />
            <div>
              <h2 className="font-extrabold text-base">Course Certificate</h2>
              <span className="text-[10px] text-muted-foreground">Verification Code: {certificate.code}</span>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-primary/95 transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Certificate</span>
          </button>
        </div>

        {/* Dynamic Vector SVG Certificate Template */}
        <div className="w-full aspect-[1.414/1] bg-amber-50/20 dark:bg-slate-900 border-[6px] border-double border-amber-600/30 p-6 md:p-12 text-center flex flex-col justify-between relative shadow-inner select-none overflow-hidden rounded-xl">
          {/* Certificate Corner Borders */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/50" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/50" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/50" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/50" />

          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Award size={200} />
          </div>

          <div className="space-y-4">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-amber-600 uppercase">Certificate of Excellence</span>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-serif">Brains Lab Academy</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground">West African Exam & UTME Prep Science Program</p>
          </div>

          <div className="space-y-3 my-6">
            <span className="text-xs text-muted-foreground block">This certifies that our student has completed the coursework and passed the CBT exam for</span>
            <span className="text-xl md:text-3xl font-extrabold text-gradient block">{certificate.courseTitle}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground block">demonstrating excellent conceptual knowledge and calculation proficiency in sciences.</span>
          </div>

          <div className="flex items-center justify-between border-t border-amber-600/20 pt-6 px-6 text-[10px] md:text-xs text-muted-foreground font-semibold">
            <div className="text-left space-y-1">
              <span>Date Issued: {certificate.date}</span>
              <span className="block text-[8px] font-mono text-muted-foreground">ID: {certificate.code}</span>
            </div>
            <div className="text-center space-y-1">
              <span className="h-6 block border-b border-slate-300 w-24 mx-auto" />
              <span>Dr. Abdul Rahmon</span>
              <span className="block text-[8px] text-muted-foreground">Program Director</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
