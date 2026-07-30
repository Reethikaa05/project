import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CSVUploader from '../components/CSVUploader';
import DatasetList from '../components/DatasetList';
import DataPreview from '../components/DataPreview';
import { Database, FileText, Sparkles, ArrowRight } from 'lucide-react';

const DataPage = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const handleUploadSuccess = (newDataset) => {
    setSelectedDataset(newDataset);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAnalyzeDataset = (dataset) => {
    navigate('/analytics', { state: { datasetId: dataset.id } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Database className="w-7 h-7 text-brand-400" />
          Data Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload CSV files, manage stored datasets with genuine server pagination, and preview raw data rows.
        </p>
      </div>

      {/* CSV Uploader Section */}
      <CSVUploader onUploadSuccess={handleUploadSuccess} />

      {/* Paginated Datasets List Section */}
      <DatasetList
        selectedDatasetId={selectedDataset?.id}
        onSelectDataset={(ds) => setSelectedDataset(ds)}
        onAnalyzeDataset={handleAnalyzeDataset}
        refreshTrigger={refreshTrigger}
      />

      {/* Data Preview Section */}
      {selectedDataset && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Raw Data Preview
            </h3>
            <button
              onClick={() => handleAnalyzeDataset(selectedDataset)}
              className="btn-primary text-xs !py-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plot & Compute Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <DataPreview dataset={selectedDataset} />
        </div>
      )}

    </div>
  );
};

export default DataPage;
