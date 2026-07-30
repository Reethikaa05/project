import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../services/api';
import { Network, Loader2, Sparkles } from 'lucide-react';

const CorrelationHeatmap = ({ dataset }) => {
  const [corrData, setCorrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCorrelation = async () => {
      if (!dataset?.id) return;
      setLoading(true);
      try {
        const res = await api.get(`/analytics/${dataset.id}/correlation`);
        setCorrData(res.data);
      } catch (err) {
        console.error('Failed to fetch correlation matrix:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCorrelation();
  }, [dataset]);

  if (!dataset) return null;

  if (loading) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400 mb-2" />
        <span className="text-xs">Calculating pairwise correlation matrix...</span>
      </div>
    );
  }

  if (!corrData || corrData.columns.length < 2) {
    return null; // Not enough numeric columns for heatmap
  }

  const { columns, matrix } = corrData;
  const heatmapData = [];

  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      heatmapData.push([j, i, val]);
    });
  });

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Pairwise Pearson Correlation Heatmap',
      left: 'center',
      textStyle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold' }
    },
    tooltip: {
      position: 'top',
      formatter: (p) => {
        const xCol = columns[p.data[0]];
        const yCol = columns[p.data[1]];
        const val = p.data[2];
        return `Correlation (${xCol} vs ${yCol}): <b>${val !== null ? val : 'N/A'}</b>`;
      }
    },
    grid: {
      height: '65%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: columns,
      axisLabel: { rotate: 30, color: '#94a3b8', fontSize: 11 },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: columns,
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitArea: { show: true }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#3b82f6', '#1e293b', '#ef4444']
      },
      textStyle: { color: '#94a3b8' }
    },
    series: [
      {
        name: 'Correlation',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          formatter: (p) => p.data[2] !== null ? p.data[2] : '',
          color: '#f8fafc',
          fontSize: 10
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-slate-100">Multi-Column Correlation Matrix</h2>
      </div>
      <ReactECharts option={option} style={{ height: '360px', width: '100%' }} />
    </div>
  );
};

export default CorrelationHeatmap;
