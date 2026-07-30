import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import StatsPanel from '../components/StatsPanel';
import ChartViewer from '../components/ChartViewer';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import InsightsBanner from '../components/InsightsBanner';
import { Sparkles, Database, Layers, ArrowLeft, Loader2 } from 'lucide-react';

const AnalyticsPage = () => {
  const location = useLocation();
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const res = await api.get('/datasets', { params: { page: 1, limit: 50 } });
        setDatasets(res.data.items);

        // Pre-select passed dataset ID or default to first dataset
        const navDatasetId = location.state?.datasetId;
        if (navDatasetId) {
          const match = res.data.items.find((d) => d.id === navDatasetId);
          if (match) setSelectedDataset(match);
          else if (res.data.items.length > 0) setSelectedDataset(res.data.items[0]);
        } else if (res.data.items.length > 0) {
          setSelectedDataset(res.data.items[0]);
        }
      } catch (err) {
        console.error('Failed to fetch datasets for analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [location.state]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-400" />
            Analytics & ECharts Visualization
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compute column statistics, render interactive Apache ECharts plots, and explore correlation matrix.
          </p>
        </div>

        {/* Dataset Selector Dropdown */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <Layers className="w-4 h-4 text-brand-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider shrink-0">Dataset:</span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
          ) : datasets.length === 0 ? (
            <span className="text-xs text-slate-500">No datasets available</span>
          ) : (
            <select
              value={selectedDataset?.id || ''}
              onChange={(e) => {
                const match = datasets.find((d) => d.id === Number(e.target.value));
                setSelectedDataset(match || null);
              }}
              className="input-field py-1 text-xs w-48 font-semibold text-brand-300"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.row_count} rows)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* No Datasets Fallback Banner */}
      {!loading && datasets.length === 0 ? (
        <div className="glass-panel p-12 text-center border-dashed border-slate-800">
          <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Datasets Available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Please upload a CSV dataset or load a demo dataset on the Data Management page first to start generating plots and statistics.
          </p>
          <Link to="/data" className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Data Management</span>
          </Link>
        </div>
      ) : selectedDataset && (
        <div className="space-y-8">
          {/* AI Insights Summary Banner */}
          <InsightsBanner dataset={selectedDataset} />

          {/* Interactive ECharts Visualizer */}
          <ChartViewer dataset={selectedDataset} />

          {/* Pairwise Pearson Correlation Heatmap */}
          <CorrelationHeatmap dataset={selectedDataset} />

          {/* Column Statistics Calculator */}
          <StatsPanel dataset={selectedDataset} />
        </div>
      )}

    </div>
  );
};

export default AnalyticsPage;
