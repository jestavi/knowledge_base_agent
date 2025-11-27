import React, { useRef } from 'react';
import { DocumentFile } from '../types';
import { formatBytes, readFileContent, generateId } from '../utils/fileUtils';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../constants';
import { Upload, FileText, Trash2, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';

interface DocumentSidebarProps {
  documents: DocumentFile[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentFile[]>>;
}

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({ documents, setDocuments }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: DocumentFile[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Simple client-side validation
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          alert(`File type ${ext} not supported in this demo. Please use text-based files (.txt, .md, .csv, etc)`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} is too large. Max 5MB.`);
          continue;
        }

        try {
          const content = await readFileContent(file);
          newFiles.push({
            id: generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: content
          });
        } catch (err) {
          console.error("Error reading file", err);
        }
      }

      setDocuments(prev => [...prev, ...newFiles]);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/50 backdrop-blur-xl border-r border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Knowledge Base</h1>
        </div>
        <p className="text-xs text-slate-400">
          Upload company docs to context-aware Q&A.
        </p>
      </div>

      {/* Upload Area */}
      <div className="p-4">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer group"
        >
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-2 transition-colors" />
          <p className="text-sm font-medium text-slate-300">Click to upload documents</p>
          <p className="text-xs text-slate-500 mt-1">TXT, MD, CSV, JSON (Max 5MB)</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileSelect}
        />
      </div>

      {/* Stats */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
          <span>Active Documents</span>
          <span>{documents.length}</span>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No documents indexed.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/80 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="min-w-[32px] h-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm text-slate-200 truncate font-medium">{doc.name}</span>
                  <span className="text-[10px] text-slate-500">{formatBytes(doc.size)}</span>
                </div>
              </div>
              <button 
                onClick={() => removeDocument(doc.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Status */}
      <div className="p-4 bg-slate-900/80 border-t border-white/5 text-[10px] text-slate-500 flex justify-between">
        <span>Model: Gemini 2.5 Flash</span>
        <span className="flex items-center gap-1 text-emerald-500">
          <CheckCircle2 className="w-3 h-3" /> System Ready
        </span>
      </div>
    </div>
  );
};

export default DocumentSidebar;
