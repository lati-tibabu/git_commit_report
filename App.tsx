import React, { useState, useEffect } from 'react';
import { ProjectData, ReportState, ReportLanguage } from './types';
import { ProjectList } from './components/ProjectList';
import { ReportView } from './components/ReportView';
import { generateTaskReport, translateReportToOromo } from './services/geminiService';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'git_report_projects';
const REPORT_STORAGE_KEY = 'git_report_data';

const App: React.FC = () => {
  // State for input data
  const [projects, setProjects] = useState<ProjectData[]>([]);
  
  // State for report generation
  const [reportState, setReportState] = useState<ReportState>({
    markdown: '',
    translatedMarkdown: null,
    isTranslating: false,
    isLoading: false,
    error: null,
    lastGenerated: null,
  });

  const [currentLanguage, setCurrentLanguage] = useState<ReportLanguage>(ReportLanguage.ENGLISH);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedReport = localStorage.getItem(REPORT_STORAGE_KEY);

    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }

    if (savedReport) {
      try {
        setReportState(JSON.parse(savedReport));
      } catch (e) {
        console.error("Failed to load report", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reportState));
  }, [reportState]);

  const handleGenerateReport = async () => {
    if (projects.length === 0) return;

    setReportState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const markdown = await generateTaskReport(projects);
      setReportState(prev => ({
        ...prev,
        isLoading: false,
        markdown: markdown,
        translatedMarkdown: null, // Reset translation on new generation
        lastGenerated: Date.now()
      }));
      setCurrentLanguage(ReportLanguage.ENGLISH);
    } catch (err: any) {
      setReportState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "An unexpected error occurred."
      }));
    }
  };

  const handleTranslate = async () => {
    if (!reportState.markdown) return;
    
    // If we already have it, just switch
    if (reportState.translatedMarkdown) {
      setCurrentLanguage(ReportLanguage.AFAAN_OROMOO);
      return;
    }

    setReportState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      const translated = await translateReportToOromo(reportState.markdown);
      setReportState(prev => ({
        ...prev,
        isTranslating: false,
        translatedMarkdown: translated
      }));
      setCurrentLanguage(ReportLanguage.AFAAN_OROMOO);
    } catch (err: any) {
      setReportState(prev => ({
        ...prev,
        isTranslating: false,
        error: "Translation failed. Please try again."
      }));
    }
  };

  const activeMarkdown = currentLanguage === ReportLanguage.ENGLISH 
    ? reportState.markdown 
    : (reportState.translatedMarkdown || reportState.markdown);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">GitReport AI</h1>
              <p className="text-xs text-slate-500 font-medium">Smart Commit Analysis & Reporting</p>
            </div>
          </div>
          <div>
            {/* Could add user profile or API key indicator here if needed */}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        
        {/* Input Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-800">Project Data</h2>
              <p className="text-slate-600 mt-2">
                Add git logs from your repositories. The AI will analyze them together to form a cohesive report.
              </p>
            </div>
            
            {projects.length > 0 && (
              <button
                onClick={handleGenerateReport}
                disabled={reportState.isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {reportState.isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Generate Report
                  </>
                )}
              </button>
            )}
          </div>

          <ProjectList projects={projects} setProjects={setProjects} />
        </section>

        {/* Error Banner */}
        {reportState.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{reportState.error}</p>
          </div>
        )}

        {/* Report Section */}
        {(reportState.markdown || reportState.isLoading) && (
          <section className="space-y-4 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Generated Report</h2>
              {reportState.lastGenerated && (
                 <span className="text-xs text-slate-400">
                   Last updated: {new Date(reportState.lastGenerated).toLocaleString()}
                 </span>
              )}
            </div>

            <ReportView
              markdown={activeMarkdown}
              isLoading={reportState.isLoading}
              isTranslating={reportState.isTranslating}
              language={currentLanguage}
              onTranslate={handleTranslate}
              onLanguageToggle={setCurrentLanguage}
              hasTranslatedVersion={!!reportState.translatedMarkdown}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;