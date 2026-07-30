import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Table, 
  Search, 
  Hash, 
  AlignLeft, 
  Tag, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Layers
} from 'lucide-react';

const DataPreview = ({ dataset }) => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 25;
  const [columnFilter, setColumnFilter] = useState('');

  const fetchPreview = async () => {
    if (!dataset?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/datasets/${dataset.id}/preview`, {
        params: { limit, offset }
      });
      setPreviewData(res.data);
    } catch (err) {
      console.error('Failed to fetch dataset preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchPreview();
  }, [dataset]);

  useEffect(() => {
    fetchPreview();
  }, [offset]);

  if (!dataset) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No Dataset Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select a dataset from the list above to preview its first 25+ raw rows.</p>
      </div>
    );
  }

  const columns = previewData?.columns_metadata || dataset.columns_metadata || [];
  const filteredColumns = columns.filter((c) =>
    c.name.toLowerCase().includes(columnFilter.toLowerCase())
  );

  return (
    <div className="glass-panel p-6">
      {/* Header & Meta Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{dataset.name}</h2>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Previewing First {previewData?.returned_rows || 25} Rows
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total {dataset.row_count.toLocaleString()} rows & {dataset.column_count} columns | File: {dataset.original_filename}
          </p>
        </div>

        {/* Filter Input Field - Flex container layout: Icon first, zero text overlap */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Filter Columns
          </label>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all w-48 sm:w-60">
            <div className="p-1 rounded-md bg-brand-500/10 text-brand-500 shrink-0 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search column names..."
              value={columnFilter}
              onChange={(e) => setColumnFilter(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-medium p-0 focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Column Type Badges Overview Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-bold mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-brand-500" /> Schema:
        </span>
        {columns.map((col) => (
          <span
            key={col.name}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-medium ${
              col.data_type === 'numeric'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                : col.data_type === 'categorical'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {col.data_type === 'numeric' ? (
              <Hash className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : col.data_type === 'categorical' ? (
              <Tag className="w-3 h-3 text-purple-500 shrink-0" />
            ) : (
              <AlignLeft className="w-3 h-3 text-slate-400 shrink-0" />
            )}
            <span>{col.name}</span>
            <span className="text-[9px] opacity-70">({col.data_type})</span>
          </span>
        ))}
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
          <span className="text-sm font-medium">Fetching raw dataset rows...</span>
        </div>
      ) : !previewData?.rows || previewData.rows.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No rows available for this preview range.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10 shadow-md">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-800 w-16 bg-slate-100 dark:bg-slate-900 text-center">
                  #
                </th>
                {filteredColumns.map((col) => (
                  <th key={col.name} className="py-3 px-4 font-semibold border-r border-slate-200 dark:border-slate-800/80 whitespace-nowrap bg-slate-100 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{col.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        col.data_type === 'numeric' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {col.data_type}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-950/40">
              {previewData.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-400 border-r border-slate-200 dark:border-slate-800/80 text-center select-none bg-slate-50 dark:bg-slate-900/30 font-semibold">
                    {offset + idx + 1}
                  </td>
                  {filteredColumns.map((col) => {
                    const val = row[col.name];
                    const displayVal = val === null || val === undefined ? (
                      <span className="text-slate-400 italic font-mono">null</span>
                    ) : typeof val === 'boolean' ? (
                      val ? 'true' : 'false'
                    ) : (
                      String(val)
                    );

                    return (
                      <td key={col.name} className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800/50 max-w-xs truncate font-mono text-slate-800 dark:text-slate-200">
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Row Pagination Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Displaying rows <strong className="text-slate-900 dark:text-slate-200">{offset + 1}</strong> to <strong className="text-slate-900 dark:text-slate-200">{Math.min(dataset.row_count, offset + limit)}</strong> of <strong className="text-slate-900 dark:text-slate-200">{dataset.row_count.toLocaleString()}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => Math.max(0, o - limit))}
            disabled={offset === 0}
            className="btn-secondary !py-1 !px-2.5 text-xs disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev 25</span>
          </button>

          <button
            onClick={() => setOffset((o) => Math.min(dataset.row_count - 1, o + limit))}
            disabled={offset + limit >= dataset.row_count}
            className="btn-secondary !py-1 !px-2.5 text-xs disabled:opacity-40"
          >
            <span>Next 25</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
