import React, { useState } from 'react';
import { ProjectData } from '../types';
import { parseGitLog } from '../services/parserService';
import { Plus, Trash2, FileText, Code } from 'lucide-react';

interface ProjectListProps {
  projects: ProjectData[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectData[]>>;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, setProjects }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newLogData, setNewLogData] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProject = () => {
    if (!newProjectName.trim() || !newLogData.trim()) return;

    const parsed = parseGitLog(newLogData);
    
    const newProject: ProjectData = {
      id: Date.now().toString(),
      name: newProjectName,
      rawLog: newLogData,
      parsedCommits: parsed,
    };

    setProjects([...projects, newProject]);
    setNewProjectName('');
    setNewLogData('');
    setIsAdding(false);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Repositories & Logs
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        )}
      </div>

      {/* List existing projects */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{project.name}</h3>
                <p className="text-sm text-slate-500">
                  {project.parsedCommits.length} commits ingested
                </p>
              </div>
            </div>
            <button
              onClick={() => removeProject(project.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Remove Project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        {projects.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-slate-500">
            <p>No projects added yet.</p>
            <p className="text-sm mt-1">Add a git log to generate a report.</p>
          </div>
        )}
      </div>

      {/* Add New Project Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Backend API"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Git Log Output</label>
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  git log --date=short --pretty=format:"%h|%an|%ad|%s"
                </span>
              </div>
              <textarea
                value={newLogData}
                onChange={(e) => setNewLogData(e.target.value)}
                placeholder="Paste your git log here..."
                className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAddProject}
                disabled={!newProjectName || !newLogData}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Project
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};