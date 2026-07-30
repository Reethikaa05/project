import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../services/api';
import { 
  BarChart3, 
  LineChart, 
  ScatterChart, 
  PieChart as PieIcon, 
  Download, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Layers
} from 'lucide-react';

const ChartViewer = ({ dataset, initialX, initialY }) => {
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [chartType, setChartType] = useState('scatter');
  const [loading, setLoading] = useState(false);
  const [chartOption, setChartOption] = useState(null);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const columns = dataset?.columns_metadata || [];
  const numericColumns = columns.filter((c) => c.data_type === 'numeric');

  useEffect(() => {
    if (dataset && columns.length > 0) {
      const firstX = initialX || columns[0]?.name || '';
      const firstY = initialY || (numericColumns.length > 1 ? numericColumns[1]?.name : columns[1]?.name || '');
      setXColumn(firstX);
      setYColumn(firstY);
    }
  }, [dataset]);

  // Auto chart recommendation
  useEffect(() => {
    if (!xColumn) return;
    const xMeta = columns.find((c) => c.name === xColumn);
    const yMeta = columns.find((c) => c.name === yColumn);

    if (!yColumn || yColumn === '') {
      setRecommendation(`Single column select: Recommended Chart is Bar (Frequency Distribution) or Pie chart.`);
      setChartType('bar');
    } else if (xMeta?.data_type === 'numeric' && yMeta?.data_type === 'numeric') {
      setRecommendation(`Both columns are quantitative numeric fields: Recommended Chart is Scatter Plot or Line Chart.`);
      setChartType('scatter');
    } else if (xMeta?.data_type !== 'numeric' && yMeta?.data_type === 'numeric') {
      setRecommendation(`Categorical X + Numeric Y: Recommended Chart is Bar Chart or Line Chart.`);
      setChartType('bar');
    }
  }, [xColumn, yColumn]);

  const handleGeneratePlot = async (overrideType) => {
    const targetType = overrideType || chartType;
    if (!dataset?.id || !xColumn) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/analytics/chart-data', {
        dataset_id: dataset.id,
        x_column: xColumn,
        y_column: yColumn || null,
        chart_type: targetType,
      });

      const opt = res.data.option;
      opt.backgroundColor = 'transparent';

      // Rich vibrant multi-color theme for clear visual distinction
      opt.color = [
        '#818cf8', // Indigo
        '#34d399', // Emerald
        '#fbbf24', // Amber
        '#f472b6', // Pink
        '#a78bfa', // Purple
        '#38bdf8', // Sky
        '#fb7185', // Rose
        '#4ade80'  // Light green
      ];

      // Title & Text Styling: High-contrast white text for crystal clear readability
      if (opt.title) {
        opt.title.textStyle = { 
          color: '#ffffff', 
          fontSize: 16, 
          fontWeight: 'bold', 
          fontFamily: 'Inter, sans-serif' 
        };
      }

      // Tooltip: Clear dark background with high-contrast text
      opt.tooltip = {
        ...opt.tooltip,
        backgroundColor: 'rgba(15, 12, 22, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        textStyle: { color: '#f8fafc', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        extraCssText: 'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); border-radius: 8px;'
      };

      // Legend Styling
      if (opt.legend) {
        opt.legend.textStyle = { color: '#e2e8f0', fontSize: 12, fontFamily: 'Inter, sans-serif' };
      }

      // X-Axis Styling
      if (opt.xAxis) {
        opt.xAxis.axisLine = { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } };
        opt.xAxis.axisLabel = { color: '#cbd5e1', fontSize: 11, fontFamily: 'Inter, sans-serif', rotate: 25 };
        opt.xAxis.splitLine = { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } };
        opt.xAxis.nameTextStyle = { color: '#ffffff', fontWeight: 'bold' };
      }

      // Y-Axis Styling
      if (opt.yAxis) {
        opt.yAxis.axisLine = { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } };
        opt.yAxis.axisLabel = { color: '#cbd5e1', fontSize: 11, fontFamily: 'Inter, sans-serif' };
        opt.yAxis.splitLine = { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } };
        opt.yAxis.nameTextStyle = { color: '#ffffff', fontWeight: 'bold' };
      }

      // Vibrant Gradient Items for Bar and Area Charts
      if (opt.series && opt.series.length > 0) {
        opt.series.forEach((s, idx) => {
          if (s.type === 'bar') {
            s.itemStyle = {
              borderRadius: [6, 6, 0, 0],
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#818cf8' },
                  { offset: 1, color: '#4f46e5' }
                ]
              }
            };
          } else if (s.type === 'line' && s.areaStyle) {
            s.lineStyle = { width: 3, color: '#34d399' };
            s.areaStyle = {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(52, 211, 153, 0.4)' },
                  { offset: 1, color: 'rgba(52, 211, 153, 0.0)' }
                ]
              }
            };
          }
        });
      }

      setChartOption(opt);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate chart visualization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (xColumn) {
      handleGeneratePlot();
    }
  }, [xColumn, yColumn, chartType]);

  if (!dataset) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-sm">Select a dataset to visualize columns as an interactive ECharts plot.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-instrument">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Interactive ECharts Visualizer
          </h2>
          <p className="text-xs text-slate-400">Plot columns as Scatter, Line, Bar, Area, or Pie charts with zoom & export.</p>
        </div>

        {/* Export PNG */}
        {chartOption && (
          <button
            onClick={() => {
              const echartsInstance = window.echartsInstance;
              if (echartsInstance) {
                const url = echartsInstance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#0a0608' });
                const a = document.createElement('a');
                a.href = url;
                a.download = `${dataset.name}_chart.png`;
                a.click();
              }
            }}
            className="btn-secondary !text-xs !py-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export PNG</span>
          </button>
        )}
      </div>

      {/* Auto Recommendation Banner */}
      {recommendation && (
        <div className="mb-6 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{recommendation}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        {/* X Column Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            X-Axis Column
          </label>
          <select
            value={xColumn}
            onChange={(e) => setXColumn(e.target.value)}
            className="input-field py-2 text-xs font-medium"
          >
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.data_type})
              </option>
            ))}
          </select>
        </div>

        {/* Y Column Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Y-Axis Column (Optional)
          </label>
          <select
            value={yColumn}
            onChange={(e) => setYColumn(e.target.value)}
            className="input-field py-2 text-xs font-medium"
          >
            <option value="">-- None (Single Column Distribution) --</option>
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.data_type})
              </option>
            ))}
          </select>
        </div>

        {/* Chart Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Chart Type
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() => setChartType('scatter')}
              className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                chartType === 'scatter' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Scatter Plot"
            >
              <ScatterChart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                chartType === 'line' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Line Chart"
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                chartType === 'bar' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                chartType === 'area' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Area Chart"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                chartType === 'pie' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Pie Chart"
            >
              <PieIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ECharts Canvas Container */}
      <div className="relative min-h-[420px] bg-slate-950/60 rounded-2xl border border-white/10 p-4">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl z-10">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-2" />
            <span className="text-sm font-medium text-slate-300">Rendering ECharts Plot...</span>
          </div>
        )}

        {chartOption ? (
          <ReactECharts
            option={chartOption}
            style={{ height: '400px', width: '100%' }}
            onChartReady={(instance) => {
              window.echartsInstance = instance;
            }}
          />
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <BarChart3 className="w-12 h-12 mb-2 opacity-40" />
            <span>Select X and Y columns to display ECharts plot</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartViewer;
