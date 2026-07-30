import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, ShieldCheck, CheckCircle, Lightbulb } from 'lucide-react';

const InsightsBanner = ({ dataset }) => {
  const [insightsData, setInsightsData] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!dataset?.id) return;
      try {
        const res = await api.get(`/analytics/${dataset.id}/insights`);
        setInsightsData(res.data);
      } catch (err) {
        console.error('Failed to fetch dataset insights:', err);
      }
    };

    fetchInsights();
  }, [dataset]);

  if (!dataset || !insightsData) return null;

  return (
    <div className="glass-panel p-6 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-brand-500/30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-brand-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Automated Data Insights
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Summary
              </span>
            </h3>
            <p className="text-xs text-slate-400">Dataset Overview for {insightsData.dataset_name}</p>
          </div>
        </div>

        {/* Quality Score Indicator */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Data Quality Score</span>
            <span className="text-base font-bold font-mono text-emerald-400">{insightsData.quality_score}% Completeness</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insightsData.insights.map((text, idx) => (
          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsBanner;
