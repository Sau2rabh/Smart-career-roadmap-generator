'use client';
import ResumeBuilder from '@/components/ResumeBuilder';

export default function ResumeBuilderPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="page-header">Resume Builder</h2>
        <p className="page-subtitle">Build a professional, well-formatted resume from scratch</p>
      </div>

      <ResumeBuilder />
    </div>
  );
}
