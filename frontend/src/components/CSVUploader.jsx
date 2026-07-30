import React, { useState } from 'react';
import api from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Layers
} from 'lucide-react';

const CSVUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.txt')) {
        setError('Please select a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      if (!datasetName) {
        // Auto populate dataset name from filename
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDatasetName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.csv') && !droppedFile.name.endsWith('.txt')) {
        setError('Please drop a valid CSV file.');
        return;
      }
      setFile(droppedFile);
      if (!datasetName) {
        const baseName = droppedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDatasetName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a CSV file to upload.');
      return;
    }
    if (!datasetName.trim()) {
      setError('Please provide a name for this dataset.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', datasetName.trim());

    try {
      const res = await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg(`Dataset "${res.data.name}" uploaded successfully!`);
      setFile(null);
      setDatasetName('');
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload dataset. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async (sampleKey) => {
    setLoadingSample(sampleKey);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/datasets/load-sample/${sampleKey}`);
      setSuccessMsg(`Demo Dataset "${res.data.name}" loaded successfully!`);
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load demo dataset.');
    } finally {
      setLoadingSample('');
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-400" />
            Upload Dataset
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload your CSV dataset or explore instantly with pre-loaded demo datasets.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dataset Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Dataset Name
          </label>
          <input
            type="text"
            placeholder="e.g. Q1 Financial Sales Data 2025"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : file
              ? 'border-emerald-500/60 bg-emerald-500/5'
              : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            accept=".csv, .txt"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer block">
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <span className="font-semibold text-slate-200">{file.name}</span>
                <span className="text-xs text-slate-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB — Click or drag another file to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-200">
                  Click to choose a CSV file or drag and drop here
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports comma (,), semicolon (;), or tab delimited CSV files up to 50MB
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading & Parsing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Store Dataset</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 1-Click Load Demo Datasets Section */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Quick Try: Load Pre-loaded Demo Datasets
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleLoadSample('sales')}
            disabled={loadingSample !== ''}
            className="btn-secondary !py-2 !text-xs justify-between group hover:border-brand-500/40"
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              <span className="truncate">Tech Sales 2025</span>
            </div>
            {loadingSample === 'sales' && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
          </button>

          <button
            onClick={() => handleLoadSample('demographics')}
            disabled={loadingSample !== ''}
            className="btn-secondary !py-2 !text-xs justify-between group hover:border-brand-500/40"
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Global Demographics</span>
            </div>
            {loadingSample === 'demographics' && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
          </button>

          <button
            onClick={() => handleLoadSample('stocks')}
            disabled={loadingSample !== ''}
            className="btn-secondary !py-2 !text-xs justify-between group hover:border-brand-500/40"
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate">Stock Prices</span>
            </div>
            {loadingSample === 'stocks' && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
