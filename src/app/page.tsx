"use client";

import { useState } from "react";
import Hero from "@/components/hero/Hero";
import IPhoneShowcase from "@/components/showcase/iPhoneShowcase";
import BuildLab from "@/components/build-lab/BuildLab";
import AppLauncherModal from "@/components/build-lab/AppLauncherModal";
import AutomationSection from "@/components/automation/AutomationSection";
import AboutSection from "@/components/about/AboutSection";
import ContactSection from "@/components/contact/ContactSection";
import { Project } from "@/data/projects";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLaunchBuildLab = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="w-full bg-black text-white min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured iPhone Projects Showcase */}
      <IPhoneShowcase onLaunchBuildLab={handleLaunchBuildLab} />

      {/* Signature Build Lab Section */}
      <BuildLab onLaunch={handleLaunchBuildLab} />

      {/* Automation Systems Section (n8n inspired) */}
      <AutomationSection />

      {/* About & Tech Grid Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Build Lab App Launcher Modal */}
      <AppLauncherModal
        project={selectedProject}
        onClose={handleCloseModal}
      />
    </div>
  );
}
