import React from 'react';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';

const HomePage = () => {
  return (
    <div className="w-full bg-[#0a0608] min-h-screen text-white font-sans overflow-x-hidden">
      {/* 1. Hero Section with Luxury Video Background & Platform Metrics */}
      <Hero />

      {/* 2. Comprehensive DataBoard Features & Topics Showcase with Parallax Background */}
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
