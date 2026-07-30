import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';

interface HeroProps {
  onBeginClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBeginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col justify-between bg-black text-white">
      
      {/* 1. Background Video */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. Dark Overlay */}
      <div className="absolute inset-0 bg-black/20 z-[1] pointer-events-none" />

      {/* 3. Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        
        {/* Left: Brand Name Serene in Dancing Script */}
        <Link to="/" className="font-dancing text-2xl md:text-3xl text-white tracking-wide drop-shadow-md">
          Serene
        </Link>

        {/* Center: Desktop Navigation Links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-12">
          <Link to="/data" className="text-white/80 hover:text-white text-sm tracking-wide transition-colors font-inter">
            About
          </Link>
          <Link to="/analytics" className="text-white/80 hover:text-white text-sm tracking-wide transition-colors font-inter">
            Services
          </Link>
          <Link to="/data" className="text-white/80 hover:text-white text-sm tracking-wide transition-colors font-inter">
            Journal
          </Link>
          <Link to="/analytics" className="text-white/80 hover:text-white text-sm tracking-wide transition-colors font-inter">
            Contact
          </Link>
        </nav>

        {/* Right (Desktop): Book a consultation button */}
        <div className="hidden md:block">
          <Link
            to="/data"
            className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow inline-block"
          >
            Book a consultation
          </Link>
        </div>

        {/* Right (Mobile): Hamburger icon with cubic-bezier animated lines */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-50 relative focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile Slide-in Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#0a0608]/95 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col justify-between p-8 pt-24 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-6">
          {['About', 'Services', 'Journal', 'Contact'].map((item, index) => (
            <Link
              key={item}
              to={item === 'Services' || item === 'Contact' ? '/analytics' : '/data'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white text-lg font-light tracking-wide hover:text-white/80 transition-all duration-300"
              style={{
                transitionDelay: `${150 + index * 75}ms`,
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
              }}
            >
              {item}
            </Link>
          ))}
        </div>

        <div
          className="pt-8 border-t border-white/10 transition-all duration-300"
          style={{
            transitionDelay: '450ms',
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
        >
          <Link
            to="/data"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full bg-white text-black py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 text-center inline-block button-glow"
          >
            Book a consultation
          </Link>
        </div>
      </div>

      {/* 4. Center Content (absolutely positioned, shifted up by -mt-[120px]) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <div className="-mt-[120px] max-w-4xl pointer-events-auto flex flex-col items-center">
          
          {/* Heading */}
          <h1 className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow font-normal">
            Gentle touch. Radiant presence.
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl font-inter font-normal leading-relaxed">
            Expert beauty and holistic wellness data analytics, delivered with warmth and intention.
          </p>

          {/* CTA Button */}
          <Link
            to="/data"
            className="mt-6 md:mt-9 bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow inline-block"
          >
            Begin your renewal
          </Link>

        </div>
      </div>

      {/* 5. Sound Indicator (Desktop only, bottom-left corner) */}
      <div className="hidden md:flex items-center gap-3 absolute bottom-8 left-8 z-30 pointer-events-auto">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
        <div className="text-white/60 text-xs font-inter leading-tight">
          <div>Experience</div>
          <div>{isMuted ? 'with sound' : 'playing sound'}</div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
