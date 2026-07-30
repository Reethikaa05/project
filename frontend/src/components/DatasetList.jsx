import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileSpreadsheet, 
  Trash2, 
  BarChart2, 
  Table, 
  Calendar, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

const DatasetList = ({
  datasets: externalDatasets,
  total: externalTotal,
  page: externalPage,
  limit: externalLimit = 6,
  onPageChange: externalOnPageChange,
  onSelectDataset,
  onAnalyzeDataset,
  selectedDatasetId,
  refreshTrigger
}) => {
  const [internalDatasets, setInternalDatasets] = useState([]);
  const [internalTotal, setInternalTotal] = useState(0);
  const [internalPage, setInternalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Determine if using external state or internal fetching
  const isExternal = Boolean(externalDatasets);
  const datasets = isExternal ? externalDatasets : internalDatasets;
  const total = isExternal ? (externalTotal || 0) : internalTotal;
  const page = isExternal ? (externalPage || 1) : internalPage;
  const limit = externalLimit;

  const fetchDatasets = async (targetPage = page) => {
    if (isExternal) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/datasets', {
        params: { page: targetPage, limit }
      });
      setInternalDatasets(res.data.items || []);
      setInternalTotal(res.data.total || 0);
      setInternalPage(res.data.page || 1);
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
      setError(err.response?.data?.detail || 'Failed to load datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets(1);
  }, [refreshTrigger]);

  const handlePageChange = (newPage) => {
    if (isExternal && externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
      fetchDatasets(newPage);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/datasets/${id}`);
      setConfirmDeleteId(null);
      fetchDatasets(page);
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const safeDatasets = Array.isArray(datasets) ? datasets : [];
  const filteredDatasets = safeDatasets.filter((ds) =>
    ds.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel border border-white/10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-instrument">Uploaded Datasets</h2>
            <p className="text-xs text-slate-400">Total {total} dataset{total === 1 ? '' : 's'} available in workspace</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 flex items-center gap-2 px-3 py-2 border border-white/15 rounded-xl bg-slate-950/70 focus-within:border-indigo-400 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 focus:ring-0 p-0"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-panel p-8 text-center text-slate-400 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
          <span className="text-xs font-medium">Fetching datasets from backend...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dataset Cards Grid */}
      {!loading && filteredDatasets.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">No datasets found.</p>
          <p className="text-xs text-slate-500 mt-1">Upload a CSV file or load a sample dataset above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDatasets.map((ds) => {
            const isSelected = selectedDatasetId === ds.id;
            const numericCount = ds.columns_metadata?.filter((c) => c.data_type === 'numeric').length || 0;

            return (
              <div
                key={ds.id}
                className={`glass-card p-5 relative flex flex-col justify-between transition-all duration-300 ${
                  isSelected
                    ? 'border-indigo-500/60 bg-indigo-950/20 shadow-xl shadow-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white truncate max-w-[180px]" title={ds.name}>
                          {ds.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 block flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(ds.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  {/* Dataset Stats Row */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/50 border border-white/5 mb-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Rows</span>
                      <span className="font-bold text-white text-sm">{ds.row_count?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Columns</span>
                      <span className="font-bold text-indigo-300 text-sm">{ds.column_count} ({numericCount} Numeric)</span>
                    </div>
                  </div>

                  {/* Columns Schema Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4 max-h-16 overflow-y-auto scrollbar-hide">
                    {ds.columns_metadata?.map((col) => (
                      <span
                        key={col.name}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${
                          col.data_type === 'numeric'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                            : col.data_type === 'categorical'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                        }`}
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDataset && onSelectDataset(ds)}
                      className={`btn-secondary !text-xs !py-1.5 !px-3 ${
                        isSelected ? '!bg-indigo-600 !text-white' : ''
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onSelectDataset) onSelectDataset(ds);
                        if (onAnalyzeDataset) onAnalyzeDataset(ds);
                      }}
                      className="btn-primary !text-xs !py-1.5 !px-3"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Plot</span>
                    </button>
                  </div>

                  {/* Delete Button */}
                  {confirmDeleteId === ds.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(ds.id)}
                        disabled={deletingId === ds.id}
                        className="btn-danger !text-[10px] !py-1 !px-2"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-slate-400 hover:text-white px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(ds.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                      title="Delete Dataset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Genuine Server Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 glass-panel border border-white/10 text-xs">
          <span className="text-slate-400 font-medium">
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span> ({total} items)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="btn-secondary !text-xs !py-1.5 !px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="btn-secondary !text-xs !py-1.5 !px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DatasetList;
