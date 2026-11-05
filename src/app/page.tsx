import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import CourseCards from "@/components/landing/CourseCards";
import StatsBar from "@/components/landing/StatsBar";
import VisualizationPreview from "@/components/landing/VisualizationPreview";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] text-text-primary transition-colors duration-200">
      {/* Ambient background illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Dark Mode Ambient Glows (Electric-Blue / Cyan) */}
        <div className="dark:block hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-gradient-to-b from-[#0A84FF]/22 via-[#0066CC]/14 to-transparent rounded-full blur-[140px]" />
          <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] bg-[#00D2FF]/[0.14] rounded-full blur-[130px]" />
          <div className="absolute bottom-[15%] left-[-10%] w-[600px] h-[600px] bg-[#0A84FF]/[0.14] rounded-full blur-[140px]" />
        </div>

        {/* Light Mode Ambient Glows (Subtle Orange Highlights rgba(255,122,0,0.08)) */}
        <div className="dark:hidden block">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[rgba(255,122,0,0.07)] rounded-full blur-[140px]" />
          <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[rgba(255,122,0,0.05)] rounded-full blur-[140px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10">
        <HeroSection />
        <StatsBar />
        <FeaturesGrid />
        <CourseCards />
        <VisualizationPreview />
      </main>

      <Footer />
    </div>
  );
}
