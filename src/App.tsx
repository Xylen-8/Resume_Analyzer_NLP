/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Phone, 
  GraduationCap, 
  Zap, 
  Target,
  ChevronRight,
  Download,
  Copy,
  Upload,
  X,
  File as FileIcon,
  LayoutDashboard,
  Lightbulb,
  ExternalLink,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  SpellCheck,
  Award,
  ShieldCheck,
  Building2,
  Search,
  Linkedin,
  Globe
} from 'lucide-react';
import { analyzeResume, ResumeAnalysisResult } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'analysis' | 'dashboard';

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<'text' | 'file' | 'multiple'>('file');
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [multipleResults, setMultipleResults] = useState<{ name: string; result: ResumeAnalysisResult }[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError(null);
    }
  };

  const readFileAsBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ data: base64String, mimeType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    const hasResume = inputType === 'text' ? resumeText.trim() : (inputType === 'file' ? resumeFile : multipleFiles.length > 0);
    if (!hasResume) {
      setError('Please provide at least one resume.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setMultipleResults([]);
    try {
      if (inputType === 'multiple') {
        const results = [];
        for (const file of multipleFiles) {
          const resumeInput = await readFileAsBase64(file);
          const data = await analyzeResume(resumeInput, jobDescription);
          results.push({ name: file.name, result: data });
        }
        setMultipleResults(results);
        setResult(results[0].result);
        setSelectedResultIndex(0);
      } else {
        let resumeInput: string | { data: string; mimeType: string };
        if (inputType === 'file' && resumeFile) {
          resumeInput = await readFileAsBase64(resumeFile);
        } else {
          resumeInput = resumeText;
        }
        const data = await analyzeResume(resumeInput, jobDescription);
        setResult(data);
      }
      setActiveTab('analysis');
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume. Please ensure the file is a valid PDF or Image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const skillData = result ? [
    { name: 'Technical', value: result.extracted_data.skills.filter(s => s.category === 'Technical').length },
    { name: 'Soft', value: result.extracted_data.skills.filter(s => s.category === 'Soft').length },
    { name: 'Tools', value: result.extracted_data.skills.filter(s => s.category === 'Tool').length },
  ] : [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight uppercase">resume analyzer</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('analysis')}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2",
                activeTab === 'analysis' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <FileText className="w-4 h-4" /> Analysis
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              disabled={!result}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2",
                activeTab === 'dashboard' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700",
                !result && "opacity-50 cursor-not-allowed"
              )}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
          </nav>

          <div className="flex items-center gap-4">
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className={cn(
          "grid gap-8 transition-all duration-500",
          (result || isAnalyzing) ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 max-w-2xl mx-auto"
        )}>
          
          {/* Inputs Section */}
          <div className={cn(
            "space-y-6 transition-all duration-500",
            (result || isAnalyzing) ? "lg:col-span-4" : "w-full"
          )}>
            <div className="glass-card p-6 space-y-6 sticky top-24">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume
                  </label>
                  <div className="flex bg-zinc-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setInputType('file')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                        inputType === 'file' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      File
                    </button>
                    <button 
                      onClick={() => setInputType('text')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                        inputType === 'text' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      Text
                    </button>
                    <button 
                      onClick={() => setInputType('multiple')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                        inputType === 'multiple' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      Multiple
                    </button>
                  </div>
                </div>

                {inputType === 'file' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "group relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center",
                      resumeFile ? "border-indigo-200 bg-indigo-50/30" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,image/*"
                    />
                    {resumeFile ? (
                      <>
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                          <FileIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 truncate max-w-[200px]">{resumeFile.name}</p>
                          <p className="text-xs text-zinc-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setResumeFile(null);
                          }}
                          className="absolute top-2 right-2 p-1 hover:bg-white rounded-full text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Click to upload resume</p>
                          <p className="text-xs text-zinc-500 mt-1">PDF or Images preferred</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : inputType === 'text' ? (
                  <textarea 
                    className="input-field h-48"
                    placeholder="Paste the candidate's resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "group relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center",
                      multipleFiles.length > 0 ? "border-indigo-200 bg-indigo-50/30" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setMultipleFiles(prev => [...prev, ...files]);
                      }}
                      className="hidden"
                      multiple
                      accept=".pdf,image/*"
                    />
                    {multipleFiles.length > 0 ? (
                      <div className="w-full space-y-2">
                        {multipleFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="text-xs font-medium truncate">{file.name}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setMultipleFiles(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <div className="pt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                          + Add More Files
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Click to upload multiple resumes</p>
                          <p className="text-xs text-zinc-500 mt-1">Select multiple PDF or Images</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Description (Optional)
                </label>
                <textarea 
                  className="input-field h-48"
                  placeholder="Paste the target job description here for specific ATS scoring, or leave blank for general career analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn-primary w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Resume
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {(result || isAnalyzing) && (
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[600px] glass-card flex flex-col items-center justify-center p-12"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
                    <Zap className="w-8 h-8 text-zinc-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Analyzing Candidate</h2>
                  <p className="text-zinc-500 animate-pulse">Extracting skills, experience, and calculating ATS score...</p>
                </motion.div>
              )}

              {result && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {multipleResults.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {multipleResults.map((res, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedResultIndex(idx);
                            setResult(res.result);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                            selectedResultIndex === idx 
                              ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                              : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                          )}
                        >
                          {res.name.split('.')[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="space-y-6">
                      {/* Score Header */}
                      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-32 h-32 shrink-0">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100" />
                            <circle
                              cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8"
                              strokeDasharray={364.4}
                              strokeDashoffset={364.4 - (364.4 * result.ats_analysis.score) / 100}
                              className={cn("transition-all duration-1000 ease-out", result.ats_analysis.score >= 70 ? "text-emerald-500" : "text-amber-500")}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{result.ats_analysis.score}%</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              {jobDescription ? 'ATS Match' : 'Market Fit'}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h2 className="text-2xl font-bold">{result.extracted_data.name}</h2>
                            {result.ats_analysis.decision === 'Shortlisted' ? (
                              <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Shortlisted
                              </span>
                            ) : (
                              <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Not Shortlisted
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {result.extracted_data.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {result.extracted_data.phone}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => {
                              const text = `
ATS Analysis for ${result.extracted_data.name}
Score: ${result.ats_analysis.score}%
Decision: ${result.ats_analysis.decision}

Strengths:
${result.ats_analysis.strengths.map(s => `- ${s}`).join('\n')}

Gaps:
${result.ats_analysis.gaps.map(g => `- ${g}`).join('\n')}

Improvement Suggestions:
${result.ats_analysis.improvement_suggestions.map(s => `- ${s}`).join('\n')}
                              `.trim();
                              navigator.clipboard.writeText(text);
                              alert('Analysis copied to clipboard!');
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                        </div>
                      </div>

                      {/* Analysis Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths
                          </h3>
                          <ul className="space-y-2">
                            {result.ats_analysis.strengths.map((s, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="glass-card p-6">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" /> Identified Gaps
                          </h3>
                          <ul className="space-y-2">
                            {result.ats_analysis.gaps.map((g, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /> {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Education & Experience */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500" /> Education
                          </h3>
                          <ul className="space-y-2">
                            {result.extracted_data.education.map((edu, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" /> {edu}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="glass-card p-6">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-zinc-500" /> Experience Summary
                          </h3>
                          <p className="text-sm text-zinc-600 leading-relaxed">
                            {result.extracted_data.experience_summary}
                          </p>
                        </div>
                      </div>

                      {/* Improvement Suggestions */}
                      <div className="glass-card p-6 bg-indigo-50/30 border-indigo-100">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" /> Resume Improvement Suggestions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.ats_analysis.improvement_suggestions.map((s, i) => (
                            <div key={i} className="p-3 bg-white border border-indigo-100 rounded-xl text-sm text-zinc-700 flex items-start gap-3">
                              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</span>
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grammar Check */}
                      <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <SpellCheck className="w-4 h-4 text-indigo-500" /> Grammar & Spell Check
                          </h3>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            result.grammar_check.score >= 90 ? "bg-emerald-100 text-emerald-700" : 
                            result.grammar_check.score >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>
                            Score: {result.grammar_check.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 mb-6 italic">"{result.grammar_check.summary}"</p>
                        
                        {result.grammar_check.issues.length > 0 ? (
                          <div className="space-y-4">
                            {result.grammar_check.issues.map((issue, i) => (
                              <div key={i} className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-red-500 line-through">{issue.original}</span>
                                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                                  <span className="text-emerald-600 font-bold">{issue.suggestion}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500">{issue.reason}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
                            <p className="text-sm">No grammar or spelling issues found!</p>
                          </div>
                        )}
                      </div>

                      {/* Public Audit (Certifications) */}
                      <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Search className="w-4 h-4 text-indigo-500" /> Public Audit (Certifications)
                        </h3>
                        
                        {result.certifications.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.certifications.map((cert, i) => (
                              <div key={i} className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-4 relative overflow-hidden">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-zinc-900 text-sm">{cert.name}</h4>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                      {cert.is_indian_institute ? <Building2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                      {cert.issuer}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 h-1 bg-zinc-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-500" style={{ width: `${cert.reputation_score}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400">{cert.reputation_score}%</span>
                                  </div>
                                </div>

                                {cert.verification_summary && (
                                  <p className="text-[10px] text-zinc-600 italic bg-white/50 p-2 rounded-lg border border-zinc-100/50">
                                    "{cert.verification_summary}"
                                  </p>
                                )}

                                <div className="grid grid-cols-3 gap-2">
                                  <a 
                                    href={cert.audit_links.google_search} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-2 bg-white border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors group"
                                  >
                                    <Search className="w-3 h-3 text-zinc-400 group-hover:text-indigo-500 mb-1" />
                                    <span className="text-[8px] font-bold text-zinc-500 uppercase">Google</span>
                                  </a>
                                  <a 
                                    href={cert.audit_links.linkedin_search} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-2 bg-white border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors group"
                                  >
                                    <Linkedin className="w-3 h-3 text-zinc-400 group-hover:text-blue-500 mb-1" />
                                    <span className="text-[8px] font-bold text-zinc-500 uppercase">LinkedIn</span>
                                  </a>
                                  {cert.audit_links.official_registry && (
                                    <a 
                                      href={cert.audit_links.official_registry} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex flex-col items-center justify-center p-2 bg-white border border-zinc-100 rounded-lg hover:bg-zinc-50 transition-colors group"
                                    >
                                      <Globe className="w-3 h-3 text-zinc-400 group-hover:text-emerald-500 mb-1" />
                                      <span className="text-[8px] font-bold text-zinc-500 uppercase">Registry</span>
                                    </a>
                                  )}
                                </div>

                                {cert.is_premium_provider && (
                                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                                    <Zap className="w-16 h-16 text-zinc-900" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                            <Search className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No certifications detected for audit.</p>
                          </div>
                        )}
                      </div>

                      {/* Recommendations */}
                      <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Target className="w-4 h-4" /> Role Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.suggested_roles.map((role, i) => (
                            <div key={i} className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-zinc-900">{role.title}</h4>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{role.match_score}% Match</span>
                              </div>
                              <p className="text-xs text-zinc-500 leading-relaxed">{role.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                          <TrendingUp className="w-8 h-8 text-indigo-500 mb-2" />
                          <span className="text-3xl font-bold">{result.ats_analysis.score}%</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ATS Performance</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                          <BarChart3 className="w-8 h-8 text-emerald-500 mb-2" />
                          <span className="text-3xl font-bold">{result.performance_analytics.industry_readiness}%</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Industry Readiness</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                          <PieChartIcon className="w-8 h-8 text-amber-500 mb-2" />
                          <span className="text-3xl font-bold">{result.extracted_data.skills.length}</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Skills Identified</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 h-[350px]">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Skill Distribution</h3>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={skillData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {skillData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex justify-center gap-4 mt-2">
                            {skillData.map((s, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{s.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="glass-card p-6 h-[350px]">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Skill Gap Analysis</h3>
                          <div className="h-full flex flex-col justify-center">
                            <p className="text-sm text-zinc-600 leading-relaxed italic">
                              "{result.performance_analytics.skill_gap_analysis}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Skill Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {['Technical', 'Soft', 'Tool'].map(category => (
                            <div key={category} className="space-y-3">
                              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{category}</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {result.extracted_data.skills.filter(s => s.category === category).map((skill, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-medium">
                                    {skill.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
