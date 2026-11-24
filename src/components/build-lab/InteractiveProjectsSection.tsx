"use client";

import { useCallback, useState } from "react";
import IPhoneShowcase from "@/components/showcase/iPhoneShowcase";
import BuildLab from "@/components/build-lab/BuildLab";
import AppLauncherModal from "@/components/build-lab/AppLauncherModal";
import { Project } from "@/data/projects";

export default function InteractiveProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLaunchBuildLab = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <>
      {/* Featured iPhone Projects Showcase */}
      <IPhoneShowcase onLaunchBuildLab={handleLaunchBuildLab} />

      {/* Signature Build Lab Section */}
      <BuildLab onLaunch={handleLaunchBuildLab} />

      {/* Build Lab App Launcher Modal */}
      <AppLauncherModal
        project={selectedProject}
        onClose={handleCloseModal}
      />
    </>
  );
}
