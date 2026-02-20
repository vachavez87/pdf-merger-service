import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  GripVertical, 
  Trash2, 
  Download, 
  Loader2,
  FilePlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Sortable File Item Component
function SortableFileItem({ file, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPdf = file.file.type === 'application/pdf';
  const Icon = isPdf ? FileText : ImageIcon;
  const size = (file.file.size / 1024 / 1024).toFixed(2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`file-card flex items-center gap-4 ${isDragging ? 'dragging' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <GripVertical className="w-5 h-5 text-slate-400" />
      </div>

      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
        <Icon className={`w-6 h-6 ${isPdf ? 'text-red-400' : 'text-green-400'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{file.file.name}</p>
        <p className="text-sm text-slate-400">
          {isPdf ? 'PDF Document' : 'Image'} • {size} MB
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
          #{index + 1}
        </span>
        <button
          onClick={() => onRemove(file.id)}
          className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors group"
        >
          <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus({ type: null, message: '' });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: true,
  });

  // Handle drag end (reordering)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Remove file
  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Merge files
  const handleMerge = async () => {
    if (files.length === 0) {
      setStatus({ type: 'error', message: 'Please add some files first' });
      return;
    }

    setIsMerging(true);
    setStatus({ type: 'loading', message: 'Merging your documents...' });

    try {
      const formData = new FormData();
      files.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });
      formData.append('order', JSON.stringify(files.map((f) => f.id)));

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${apiUrl}/api/merge`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `merged-invoice-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatus({ 
        type: 'success', 
        message: 'PDF merged successfully! Download started.' 
      });
      
      // Optional: Clear files after successful merge
      // setFiles([]);
      
    } catch (error) {
      console.error('Merge error:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to merge files. Please try again.' 
      });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/30">
            <FilePlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Invoice PDF Merger
          </h1>
          <p className="text-slate-400 text-lg">
            Combine PDFs and images into a single document. Drag to reorder.
          </p>
        </div>

        {/* Main Content */}
        <div className="glass-panel p-6 md:p-8">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6
              ${isDragActive 
                ? 'dropzone-active' 
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <p className="text-lg font-medium text-white mb-2">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-slate-400">
              or click to select PDFs and images (PNG, JPG, WEBP)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm text-cyan-400">
                    {files.length}
                  </span>
                  Files to Merge
                </h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={files.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {files.map((file, index) => (
                      <SortableFileItem
                        key={file.id}
                        file={file}
                        index={index}
                        onRemove={removeFile}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <p className="text-xs text-slate-500 mt-3 text-center">
                💡 Drag the handle (⋮⋮) to reorder pages. Files will be merged from top to bottom.
              </p>
            </div>
          )}

          {/* Merge Button */}
          <button
            onClick={handleMerge}
            disabled={isMerging || files.length === 0}
            className="w-full btn-primary flex items-center justify-center gap-2 text-lg"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Merge & Download PDF
              </>
            )}
          </button>

          {/* Status Messages */}
          {status.type && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
              status.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
              'bg-blue-500/20 border border-blue-500/30 text-blue-400'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               status.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
               <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{status.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Supports PDF, PNG, JPG, WEBP • Max 50MB per file</p>
          <p className="mt-1">Files are processed locally and automatically deleted after download</p>
        </div>
      </div>
    </div>
  );
}

export default App;