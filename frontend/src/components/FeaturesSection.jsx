import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Calculator, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  Table,
  Sparkles
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: "1. CSV Schema & Delimiter Engine",
    subtitle: "Automatic CSV Parsing & Server Pagination",
    description: "Upload custom CSV files with auto-detection for comma, semicolon, or tab delimiters. Automatically infers column data types (numeric, categorical, text) and provides genuine server-side pagination (page 1 to N).",
    badge: "FastAPI Dataset Service",
    color: "from-blue-500 to-indigo-600",
    link: "/data"
  },
  {
    icon: BarChart3,
    title: "2. Multi-Color ECharts Visualizer",
    subtitle: "Interactive Scatter, Line, Bar, Area & Pie Plots",
    description: "Plot any 2 columns with zoom, pan, auto-recommendation banner, and 1-click high-resolution PNG image export. Features crisp high-contrast text and vibrant multi-color palettes.",
    badge: "Apache ECharts v5.5",
    color: "from-emerald-500 to-teal-600",
    link: "/analytics"
  },
  {
    icon: Calculator,
    title: "3. Statistical Compute Calculator",
    subtitle: "Min, Max, Sum, Mean, Median & Std Dev",
    description: "Compute complete descriptive statistical bounds on any dataset column. Includes full edge-case protection with 400 Bad Request error handling for empty or non-numeric columns.",
    badge: "NumPy & Pandas Engine",
    color: "from-amber-500 to-orange-600",
    link: "/analytics"
  },
  {
    icon: Layers,
    title: "4. Pairwise Pearson Correlation",
    subtitle: "Heatmap Matrix & Dataset Health Score",
    description: "Calculate multi-column pairwise Pearson correlation matrices and automated dataset completeness health scores to uncover hidden statistical signals instantly.",
    badge: "Analytics Service",
    color: "from-purple-500 to-indigo-600",
    link: "/analytics"
  },
  {
    icon: ShieldCheck,
    title: "5. JWT Security & Profile Manager",
    subtitle: "Bcrypt Hashing & Auto Token Refresh",
    description: "User authentication powered by PyJWT and bcrypt password hashing. Axios interceptors automatically refresh expired JWT tokens on 401 Unauthorized responses.",
    badge: "Auth Context & Interceptor",
    color: "from-rose-500 to-pink-600",
    link: "/auth"
  },
  {
    icon: Cpu,
    title: "6. Modern Full-Stack Stack",
    subtitle: "FastAPI + React 18 + Vite + Tailwind",
    description: "Architected for high throughput, dark/light theme switching, smooth animations, and clean modular backend services.",
    badge: "Production Ready",
    color: "from-sky-500 to-cyan-600",
    link: "/data"
  }
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);

  const [rainbowY, setRainbowY] = useState(120);
  const [leftCloudX, setLeftCloudX] = useState(-200);
  const [rightCloudX, setRightCloudX] = useState(200);
  const [cloudY, setCloudY] = useState(0);
  const [cloudOpacity, setCloudOpacity] = useState(0);

  const currentRainbowY = useRef(120);
  const currentLeftCloudX = useRef(-200);
  const currentRightCloudX = useRef(200);
  const currentCloudY = useRef(0);
  const currentCloudOpacity = useRef(0);

  useEffect(() => {
    let animFrameId;

    const updateParallax = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));

      const targetRainbowY = 120 - clampedProgress * 280;

      let targetCloudX = -200;
      let targetOpacity = 0;

      if (clampedProgress >= 0.05 && clampedProgress <= 0.95) {
        targetCloudX = 0;
        targetOpacity = 1;
      } else {
        targetCloudX = -200;
        targetOpacity = 0;
      }

      const targetCloudY = clampedProgress * -50;

      currentRainbowY.current += (targetRainbowY - currentRainbowY.current) * 0.06;
      currentLeftCloudX.current += (targetCloudX - currentLeftCloudX.current) * 0.04;
      currentRightCloudX.current += (-targetCloudX - currentRightCloudX.current) * 0.04;
      currentCloudY.current += (targetCloudY - currentCloudY.current) * 0.04;
      currentCloudOpacity.current += (targetOpacity - currentCloudOpacity.current) * 0.04;

      setRainbowY(currentRainbowY.current);
      setLeftCloudX(currentLeftCloudX.current);
      setRightCloudX(currentRightCloudX.current);
      setCloudY(currentCloudY.current);
      setCloudOpacity(currentCloudOpacity.current);

      animFrameId = requestAnimationFrame(updateParallax);
    };

    animFrameId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full py-20 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)',
      }}
    >
      {/* 1. Rainbow image - top parallax */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png"
        alt="Rainbow Accent"
        className="absolute inset-x-0 top-0 z-10 w-full object-cover pointer-events-none transition-transform"
        style={{
          transform: `translate3d(0, ${rainbowY}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* 2. Left cloud */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Left Cloud"
        className="hidden sm:block absolute left-0 bottom-[10%] z-10 w-[500px] md:w-[650px] pointer-events-none"
        style={{
          marginLeft: '-50%',
          transform: `translate3d(${leftCloudX}px, ${cloudY}px, 0)`,
          opacity: cloudOpacity,
          willChange: 'transform, opacity',
        }}
      />

      {/* 3. Right cloud */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Right Cloud"
        className="hidden sm:block absolute right-0 bottom-[15%] z-10 w-[500px] md:w-[650px] scale-x-[-1] pointer-events-none"
        style={{
          marginRight: '-75%',
          transform: `translate3d(${rightCloudX}px, ${cloudY}px, 0) scaleX(-1)`,
          opacity: cloudOpacity,
          willChange: 'transform, opacity',
        }}
      />

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl w-full mx-auto text-center">
        
        {/* Section Header */}
        <div className="mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-300 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>DATABOARD ARCHITECTURE & FEATURE TOPICS</span>
          </div>
          <h2 className="font-instrument text-4xl sm:text-6xl md:text-7xl font-normal text-white drop-shadow-lg leading-tight mb-4">
            Everything You Need for Data Excellence.
          </h2>
          <p className="text-white/80 text-base sm:text-lg font-inter max-w-xl mx-auto">
            From raw CSV ingest to deep statistical correlation, DataBoard provides a full-stack platform for accurate, beautiful data insights.
          </p>
        </div>

        {/* 6 Core Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-16">
          {FEATURES.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 border border-white/15 bg-black/40 backdrop-blur-xl group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-lg`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 font-instrument">
                    {item.title}
                  </h3>
                  <h4 className="text-xs font-semibold text-brand-300 mb-3 font-mono">
                    {item.subtitle}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-inter mb-6">
                    {item.description}
                  </p>
                </div>

                <Link
                  to={item.link}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-brand-300 transition-colors pt-4 border-t border-white/10"
                >
                  <span>Launch Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Project Callout Banner */}
        <div className="p-8 rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/20 text-center max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-white font-instrument mb-1">
              Ready to analyze your custom CSV dataset?
            </h3>
            <p className="text-xs text-gray-300 font-inter">
              Upload your data in seconds or try our pre-loaded sample datasets right now.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/data"
              className="bg-white text-black font-semibold text-xs px-6 py-3 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
            >
              Data Management
            </Link>
            <Link
              to="/analytics"
              className="btn-secondary !text-xs !py-3 !px-6"
            >
              Plot Visualizations
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
};

export default FeaturesSection;
