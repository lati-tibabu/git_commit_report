import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Languages, Check, Copy, Download } from 'lucide-react';
import { ReportLanguage } from '../types';

interface ReportViewProps {
  markdown: string | null;
  isLoading: boolean;
  isTranslating: boolean;
  language: ReportLanguage;
  onTranslate: () => void;
  onLanguageToggle: (lang: ReportLanguage) => void;
  hasTranslatedVersion: boolean;
}

export const ReportView: React.FC<ReportViewProps> = ({
  markdown,
  isLoading,
  isTranslating,
  language,
  onTranslate,
  onLanguageToggle,
  hasTranslatedVersion
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (markdown) {
      navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${language.toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Analyzing commit history...</p>
        <p className="text-sm">Gemini is clustering tasks and generating insights.</p>
      </div>
    );
  }

  if (!markdown) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
        <p>No report generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-10">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => onLanguageToggle(ReportLanguage.ENGLISH)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === ReportLanguage.ENGLISH
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                if (hasTranslatedVersion) {
                  onLanguageToggle(ReportLanguage.AFAAN_OROMOO);
                } else {
                  onTranslate();
                }
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                language === ReportLanguage.AFAAN_OROMOO
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
              Afaan Oromoo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Download Markdown"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 prose prose-slate max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
};