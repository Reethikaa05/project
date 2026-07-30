import React, { useEffect, useRef, useState } from 'react';

const QuoteSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Parallax target and current smooth values
  const [progress, setProgress] = useState(0);

  const currentRainbowY = useRef(120);
  const currentLeftCloudX = useRef(-200);
  const currentRightCloudX = useRef(200);
  const currentCloudY = useRef(0);
  const currentCloudOpacity = useRef(0);

  const [rainbowY, setRainbowY] = useState(120);
  const [leftCloudX, setLeftCloudX] = useState(-200);
  const [rightCloudX, setRightCloudX] = useState(200);
  const [cloudY, setCloudY] = useState(0);
  const [cloudOpacity, setCloudOpacity] = useState(0);

  useEffect(() => {
    let animFrameId: number;

    const updateParallax = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress (0 to 1)
      const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));
      setProgress(clampedProgress);

      // Target calculations
      const targetRainbowY = 120 - clampedProgress * 280; // +120px to -160px

      // Cloud X slide in between progress 0.12 and 0.92
      let targetCloudX = -200;
      let targetOpacity = 0;

      if (clampedProgress >= 0.12 && clampedProgress <= 0.92) {
        targetCloudX = 0; // slide into view
        targetOpacity = 1;
      } else {
        targetCloudX = -200;
        targetOpacity = 0;
      }

      const targetCloudY = clampedProgress * -50;

      // Lerp smooth interpolation
      currentRainbowY.current += (targetRainbowY - currentRainbowY.current) * 0.06;
      currentLeftCloudX.current += (targetCloudX - currentLeftCloudX.current) * 0.04;
      currentRightCloudX.current += (-targetCloudX - currentRightCloudX.current) * 0.04; // Flipped direction for right
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
      className="relative h-screen w-full overflow-hidden flex items-center justify-center px-6 md:px-12"
      style={{
        background: 'linear-gradient(180deg, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)',
      }}
    >
      {/* 1. Rainbow image - top parallax */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png"
        alt="Rainbow Accent"
        className="absolute inset-x-0 top-0 z-30 w-full object-cover pointer-events-none transition-transform"
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

      {/* 3. Right cloud (flipped horizontally) */}
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

      {/* 4. Quote Content */}
      <div className="relative z-20 max-w-4xl text-center">
        <p className="font-instrument text-white text-xl sm:text-2xl md:text-4xl lg:text-[42px] leading-[1.45] md:leading-[1.5] drop-shadow-lg font-normal">
          &ldquo;Serene DataBoard was founded on a belief in beauty and analytics that honors your data&rsquo;s true nature. We pursue refined outcomes, considered approaches, and lasting vitality. We spend time learning what matters to you before deciding what serves you best. No rushing, no excess &mdash; just support that lets you feel radiant.&rdquo;
        </p>
        
        <p className="mt-6 md:mt-8 text-white/80 text-sm md:text-base tracking-wide font-inter font-medium">
          Dr. Mia Callahan &mdash; Founder
        </p>
      </div>

    </section>
  );
};

export default QuoteSection;
