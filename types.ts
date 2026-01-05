export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface ProjectData {
  id: string;
  name: string;
  rawLog: string;
  parsedCommits: Commit[];
}

export interface ReportState {
  markdown: string;
  translatedMarkdown: string | null;
  isTranslating: boolean;
  isLoading: boolean;
  error: string | null;
  lastGenerated: number | null;
}

export enum ReportLanguage {
  ENGLISH = 'ENGLISH',
  AFAAN_OROMOO = 'AFAAN_OROMOO',
}