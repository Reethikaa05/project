import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  UploadCloud, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Database,
  PieChart
} from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between bg-black text-white overflow-hidden">
      
      {/* 1. Full-screen Background Video */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* 2. Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none" />

      {/* 3. Center Content Container */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 pt-20 pb-12 text-center">
        <div className="max-w-4xl flex flex-col items-center">
          
          {/* Top Feature Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-300 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>DataBoard Platform v1.0 &bull; Automated Data Analytics & ECharts Engine</span>
          </div>

          {/* Instrument Serif Main Headline */}
          <h1 className="font-instrument text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-center text-glow font-normal mb-6">
            Precision Data. Instant Insights.
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-base sm:text-lg md:text-xl text-center max-w-2xl font-inter font-normal leading-relaxed mb-8">
            Upload custom CSV datasets, infer column schemas, compute statistical bounds, and render interactive multi-color ECharts plots in real time.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/data"
              className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow inline-flex items-center gap-2.5 shadow-xl"
            >
              <UploadCloud className="w-5 h-5 text-brand-600" />
              <span>Upload Dataset Now</span>
            </Link>

            <Link
              to="/analytics"
              className="rounded-full font-semibold liquid-glass px-8 py-3.5 text-sm text-white hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-indigo-300" />
              <span>Explore Interactive Plots</span>
              <ArrowRight className="w-4 h-4 text-brand-400" />
            </Link>
          </div>

          {/* Real-time Platform Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl p-4 rounded-2xl liquid-glass border border-white/15 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">CSV Parser</span>
                <span className="text-xs font-extrabold text-white">Auto Delimiter</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">ECharts Plot</span>
                <span className="text-xs font-extrabold text-white">5 Visual Types</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Compute Speed</span>
                <span className="text-xs font-extrabold text-white">&lt; 0.02s Query</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Protection</span>
                <span className="text-xs font-extrabold text-white">100% Edge-Case</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;
