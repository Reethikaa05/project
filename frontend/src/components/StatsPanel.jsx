import React, { useState } from 'react';
import api from '../services/api';
import { 
  Calculator, 
  Hash, 
  TrendingUp, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  PieChart,
  Activity,
  Layers
} from 'lucide-react';

const StatsPanel = ({ dataset }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [statType, setStatType] = useState('sum');
  const [loading, setLoading] = useState(false);
  const [statResult, setStatResult] = useState(null);
  const [error, setError] = useState('');

  if (!dataset) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        <Calculator className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">Select a dataset to compute statistical analytics on any column.</p>
      </div>
    );
  }

  const columns = dataset.columns_metadata || [];

  const handleCompute = async (e) => {
    e.preventDefault();
    if (!selectedColumn) {
      setError('Please select a column to calculate statistics.');
      return;
    }

    setLoading(true);
    setError('');
    setStatResult(null);

    try {
      const res = await api.post('/analytics/compute', {
        dataset_id: dataset.id,
        column_name: selectedColumn,
        stat_type: statType,
      });
      setStatResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to compute statistic for column.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-brand-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-100">Column Statistics Calculator</h2>
          <p className="text-xs text-slate-400">Compute min, max, sum, mean, median, or std dev on any numeric column.</p>
        </div>
      </div>

      <form onSubmit={handleCompute} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Column Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Column
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="input-field"
          >
            <option value="">-- Choose Column --</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.data_type})
              </option>
            ))}
          </select>
        </div>

        {/* Statistic Type Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Statistic Function
          </label>
          <select
            value={statType}
            onChange={(e) => setStatType(e.target.value)}
            className="input-field"
          >
            <option value="min">Min (Minimum Value)</option>
            <option value="max">Max (Maximum Value)</option>
            <option value="sum">Sum (Total Addition)</option>
            <option value="mean">Mean (Average)</option>
            <option value="median">Median (Middle Value)</option>
            <option value="std">Std Dev (Standard Deviation)</option>
            <option value="count">Count (Non-null rows)</option>
            <option value="null_count">Null Count (Missing values)</option>
          </select>
        </div>

        {/* Compute Button */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading || !selectedColumn}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Compute Statistic</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3 animate-fade-in mb-4">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-200">Computation Edge Case</h4>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Computation Result Output Card */}
      {statResult && (
        <div className="p-5 bg-gradient-to-r from-brand-900/40 via-indigo-900/30 to-slate-900/60 border border-brand-500/40 rounded-2xl animate-fade-in shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase font-semibold text-brand-300 tracking-wider">
                  Computed Result
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {statResult.column_type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                {statResult.stat_type.toUpperCase()} of <span className="text-brand-400">{statResult.column_name}</span>
              </h3>
            </div>

            <div className="bg-slate-950/80 px-6 py-3 rounded-xl border border-brand-500/30 text-center sm:text-right">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                {typeof statResult.value === 'number'
                  ? statResult.value.toLocaleString(undefined, { maximumFractionDigits: 4 })
                  : String(statResult.value)}
              </span>
              <span className="text-[11px] text-slate-400">
                {statResult.valid_count} valid entries out of {statResult.total_rows} total rows
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
