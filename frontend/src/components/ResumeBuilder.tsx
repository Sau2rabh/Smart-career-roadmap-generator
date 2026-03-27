'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Globe, Linkedin, Briefcase, GraduationCap, 
  Code, FolderGit2, Award, Languages, Heart, FileText, Download, 
  Plus, Trash2, ChevronRight, ChevronLeft, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    duration: string;
    grade: string;
  }[];
  skills: string[];
  projects: {
    title: string;
    link: string;
    description: string;
  }[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  interests: string[];
}

const initialData: ResumeData = {
  personal: { fullName: '', email: '', phone: '', website: '', linkedin: '', location: '' },
  summary: '',
  experience: [{ company: '', role: '', duration: '', description: '' }],
  education: [{ school: '', degree: '', duration: '', grade: '' }],
  skills: [''],
  projects: [{ title: '', link: '', description: '' }],
  certifications: [''],
  achievements: [''],
  languages: [''],
  interests: [''],
};

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const steps = [
    { title: 'Personal', icon: User },
    { title: 'Summary', icon: FileText },
    { title: 'Experience', icon: Briefcase },
    { title: 'Education', icon: GraduationCap },
    { title: 'Skills', icon: Code },
    { title: 'Projects', icon: FolderGit2 },
    { title: 'Extras', icon: Award },
  ];

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
    setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const addItem = (section: keyof ResumeData, template: any) => {
    setData(prev => ({ ...prev, [section]: [...(prev[section] as any[]), template] }));
  };

  const removeItem = (section: keyof ResumeData, index: number) => {
    setData(prev => ({ 
      ...prev, 
      [section]: (prev[section] as any[]).filter((_, i) => i !== index) 
    }));
  };

  const updateItem = (section: keyof ResumeData, index: number, field: string | null, value: string) => {
    setData(prev => {
      const newList = [...(prev[section] as any[])];
      if (field) {
        newList[index] = { ...newList[index], [field]: value };
      } else {
        newList[index] = value;
      }
      return { ...prev, [section]: newList };
    });
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsGenerating(true);
    try {
      // Small delay to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debugging
        windowWidth: resumeRef.current.scrollWidth,
        windowHeight: resumeRef.current.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const contentRatio = imgProps.height / imgProps.width;
      const imgHeight = pdfWidth * contentRatio;
      
      // If content is longer than one page, we could potentially split it, 
      // but for now let's just ensure the first page fits
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      
      pdf.save(`${data.personal.fullName || 'Resume'}.pdf`);
      toast.success('Resume downloaded! 🚀');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Form Sidebar */}
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((step, i) => (
            <Button
              key={step.title}
              variant={activeStep === i ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStep(i)}
              className={`rounded-xl flex-shrink-0 gap-2 ${activeStep === i ? 'bg-purple-600' : ''}`}
            >
              <step.icon className="w-4 h-4" />
              {step.title}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {steps[activeStep].title} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeStep === 0 && ( /* Personal */
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Full Name</label>
                      <Input value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Email</label>
                      <Input value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Phone</label>
                      <Input value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="+1 234 567 890" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Location</label>
                      <Input value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} placeholder="City, Country" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Website</label>
                      <Input value={data.personal.website} onChange={e => updatePersonal('website', e.target.value)} placeholder="portfolio.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">LinkedIn</label>
                      <Input value={data.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/john" />
                    </div>
                  </div>
                )}

                {activeStep === 1 && ( /* Summary */
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Professional Summary</label>
                    <Textarea 
                      value={data.summary} 
                      onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Write a brief overview of your professional background..."
                      className="h-48"
                    />
                  </div>
                )}

                {activeStep === 2 && ( /* Experience */
                  <div className="space-y-6">
                    {data.experience.map((exp, i) => (
                      <div key={i} className="space-y-3 p-4 border border-border/50 rounded-xl relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem('experience', i)}
                          className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={exp.company} onChange={e => updateItem('experience', i, 'company', e.target.value)} placeholder="Company" />
                          <Input value={exp.role} onChange={e => updateItem('experience', i, 'role', e.target.value)} placeholder="Role" />
                        </div>
                        <Input value={exp.duration} onChange={e => updateItem('experience', i, 'duration', e.target.value)} placeholder="Duration (e.g. Jan 2020 - Present)" />
                        <Textarea value={exp.description} onChange={e => updateItem('experience', i, 'description', e.target.value)} placeholder="Description..." />
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={() => addItem('experience', { company: '', role: '', duration: '', description: '' })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </div>
                )}

                {activeStep === 3 && ( /* Education */
                  <div className="space-y-6">
                    {data.education.map((edu, i) => (
                      <div key={i} className="space-y-3 p-4 border border-border/50 rounded-xl relative group">
                        <Button variant="ghost" size="icon" onClick={() => removeItem('education', i)} className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></Button>
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={edu.school} onChange={e => updateItem('education', i, 'school', e.target.value)} placeholder="University" />
                          <Input value={edu.degree} onChange={e => updateItem('education', i, 'degree', e.target.value)} placeholder="Degree" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={edu.duration} onChange={e => updateItem('education', i, 'duration', e.target.value)} placeholder="Duration" />
                          <Input value={edu.grade} onChange={e => updateItem('education', i, 'grade', e.target.value)} placeholder="Grade/GPA" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={() => addItem('education', { school: '', degree: '', duration: '', grade: '' })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Education
                    </Button>
                  </div>
                )}

                {activeStep === 4 && ( /* Skills */
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {data.skills.filter(s => s).map((s, i) => <Badge key={i} className="rounded-full">{s}</Badge>)}
                    </div>
                    {data.skills.map((skill, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={skill} onChange={e => updateItem('skills', i, null, e.target.value)} placeholder="Skill name" />
                        <Button variant="ghost" size="icon" onClick={() => removeItem('skills', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={() => addItem('skills', '')}>
                      <Plus className="w-4 h-4 mr-2" /> Add Skill
                    </Button>
                  </div>
                )}

                {activeStep === 5 && ( /* Projects */
                  <div className="space-y-6">
                    {data.projects.map((proj, i) => (
                      <div key={i} className="space-y-3 p-4 border border-border/50 rounded-xl relative group">
                        <Button variant="ghost" size="icon" onClick={() => removeItem('projects', i)} className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></Button>
                        <Input value={proj.title} onChange={e => updateItem('projects', i, 'title', e.target.value)} placeholder="Project Title" />
                        <Input value={proj.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} placeholder="Link (GitHub/Demo)" />
                        <Textarea value={proj.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} placeholder="Description..." />
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={() => addItem('projects', { title: '', link: '', description: '' })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Project
                    </Button>
                  </div>
                )}

                {activeStep === 6 && ( /* Extras */
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <h4 className="text-xs font-semibold uppercase opacity-50">Certifications</h4>
                       {data.certifications.map((c, i) => (
                         <div key={i} className="flex gap-2">
                           <Input value={c} onChange={e => updateItem('certifications', i, null, e.target.value)} placeholder="Certification" />
                           <Button variant="ghost" onClick={() => removeItem('certifications', i)}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                       ))}
                       <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => addItem('certifications', '')}>+ Add</Button>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs font-semibold uppercase opacity-50">Academic Achievements</h4>
                       {data.achievements.map((a, i) => (
                         <div key={i} className="flex gap-2">
                           <Input value={a} onChange={e => updateItem('achievements', i, null, e.target.value)} placeholder="Achievement" />
                           <Button variant="ghost" onClick={() => removeItem('achievements', i)}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                       ))}
                       <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => addItem('achievements', '')}>+ Add</Button>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs font-semibold uppercase opacity-50">Languages</h4>
                       {data.languages.map((l, i) => (
                         <div key={i} className="flex gap-2">
                           <Input value={l} onChange={e => updateItem('languages', i, null, e.target.value)} placeholder="Language" />
                           <Button variant="ghost" onClick={() => removeItem('languages', i)}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                       ))}
                       <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => addItem('languages', '')}>+ Add</Button>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs font-semibold uppercase opacity-50">Interests</h4>
                       {data.interests.map((it, i) => (
                         <div key={i} className="flex gap-2">
                           <Input value={it} onChange={e => updateItem('interests', i, null, e.target.value)} placeholder="Interest" />
                           <Button variant="ghost" onClick={() => removeItem('interests', i)}><Trash2 className="w-4 h-4" /></Button>
                         </div>
                       ))}
                       <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => addItem('interests', '')}>+ Add</Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-0 flex justify-between">
                <Button variant="outline" disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button onClick={() => setActiveStep(s => s + 1)}>
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={downloadPDF} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-sm uppercase tracking-widest opacity-50">Live Preview</h3>
          <Button variant="outline" size="sm" onClick={downloadPDF} disabled={isGenerating} className="rounded-xl h-8 text-xs gap-2">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Download
          </Button>
        </div>

        <div style={{ backgroundColor: '#ffffff', color: '#000000' }} className="p-8 rounded-sm shadow-2xl min-h-[1000px] font-serif overflow-hidden" id="resume-preview" ref={resumeRef}>
          {/* Header */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '8px' }} className="mb-6 text-center">
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">{data.personal.fullName || 'YOUR NAME'}</h1>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px]" style={{ color: '#475569' }}>
              {data.personal.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.personal.email}</span>}
              {data.personal.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.personal.phone}</span>}
              {data.personal.location && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {data.personal.location}</span>}
              {data.personal.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {data.personal.linkedin}</span>}
              {data.personal.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {data.personal.website}</span>}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="mb-6">
              <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-sm font-bold uppercase mb-2">Professional Summary</h2>
              <p className="text-xs leading-relaxed" style={{ color: '#1e293b' }}>{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience.some(e => e.company) && (
            <div className="mb-6">
              <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-sm font-bold uppercase mb-2">Professional Experience</h2>
              <div className="space-y-4">
                {data.experience.map((exp, i) => exp.company && (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-bold" style={{ color: '#0f172a' }}>{exp.role || 'Role'}</h3>
                      <span className="text-[10px] italic font-sans" style={{ color: '#64748b' }}>{exp.duration}</span>
                    </div>
                    <p className="text-[11px] font-semibold mb-1" style={{ color: '#334155' }}>{exp.company}</p>
                    <p className="text-[10px] leading-snug whitespace-pre-wrap" style={{ color: '#1e293b' }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.some(e => e.school) && (
            <div className="mb-6">
              <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-sm font-bold uppercase mb-2">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu, i) => edu.school && (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold" style={{ color: '#0f172a' }}>{edu.school}</h3>
                      <span className="text-[10px] italic font-sans" style={{ color: '#64748b' }}>{edu.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-[10px]" style={{ color: '#334155' }}>{edu.degree}</p>
                      {edu.grade && <span className="text-[10px] font-bold" style={{ color: '#475569' }}>GPA: {edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* Left Col */}
            <div>
              {/* Skills */}
              {data.skills.some(s => s) && (
                <div className="mb-6">
                  <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-[11px] font-bold uppercase mb-2">Skills</h2>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {data.skills.map((s, i) => s && (
                      <span key={i} className="text-[10px]" style={{ color: '#1e293b' }}>
                        {s}{i < data.skills.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {data.projects.some(p => p.title) && (
                <div className="mb-6">
                  <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-[11px] font-bold uppercase mb-2">Selected Projects</h2>
                  <div className="space-y-3">
                    {data.projects.map((proj, i) => proj.title && (
                      <div key={i}>
                        <h3 className="text-[10px] font-bold" style={{ color: '#0f172a' }}>{proj.title}</h3>
                        {proj.link && <p className="text-[8px] underline mb-1" style={{ color: '#2563eb' }}>{proj.link}</p>}
                        <p className="text-[10px] leading-tight" style={{ color: '#1e293b' }}>{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col */}
            <div>
              {/* Certifications */}
              {data.certifications.some(c => c) && (
                <div className="mb-6">
                  <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-[11px] font-bold uppercase mb-2">Certifications</h2>
                  <ul className="list-disc list-inside space-y-1">
                    {data.certifications.map((c, i) => c && (
                      <li key={i} className="text-[10px] leading-tight" style={{ color: '#1e293b' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {data.languages.some(l => l) && (
                 <div className="mb-6">
                    <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-[11px] font-bold uppercase mb-2">Languages</h2>
                    <div className="flex flex-wrap gap-2">
                       {data.languages.map((l, i) => l && (
                         <span key={i} className="text-[10px] px-2 py-0.5 rounded font-sans" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>{l}</span>
                       ))}
                    </div>
                 </div>
              )}

              {/* Achievements */}
              {data.achievements.some(a => a) && (
                 <div className="mb-6">
                    <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-[11px] font-bold uppercase mb-2">Achievements</h2>
                    <ul className="list-disc list-inside space-y-1">
                       {data.achievements.map((a, i) => a && (
                         <li key={i} className="text-[10px] leading-tight" style={{ color: '#1e293b' }}>{a}</li>
                       ))}
                    </ul>
                 </div>
              )}

              {/* Interests */}
              {data.interests.some(it => it) && (
                 <div className="mb-6">
                    <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }} className="text-[11px] font-bold uppercase mb-2">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                       {data.interests.map((it, i) => it && (
                         <span key={i} className="text-[10px] italic font-sans" style={{ color: '#475569' }}>{it}{i < data.interests.length - 1 ? ',' : ''}</span>
                       ))}
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
