"use client";

import { useCallback, useState } from "react";
import WebShowcase from "@/components/showcase/WebShowcase";
import IPhoneShowcase from "@/components/showcase/iPhoneShowcase";
import BuildLab from "@/components/build-lab/BuildLab";
import AppLauncherModal from "@/components/build-lab/AppLauncherModal";
import { Project, ProjectRoute } from "@/data/projects";

export default function InteractiveProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedInitialRoute, setSelectedInitialRoute] = useState<
    ProjectRoute | undefined
  >(undefined);

  const handleLaunchBuildLab = useCallback(
    (project: Project, initialRoute?: ProjectRoute) => {
      setSelectedInitialRoute(initialRoute);
      setSelectedProject(project);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
    setSelectedInitialRoute(undefined);
  }, []);

  return (
    <>
      {/* Featured Projects Section (Flagship Web Platform + Mobile iPhone Showcase) */}
      <section id="projects" className="w-full bg-black text-white overflow-x-clip">
        <WebShowcase onLaunchBuildLab={handleLaunchBuildLab} />
        <IPhoneShowcase onLaunchBuildLab={handleLaunchBuildLab} />
      </section>

      {/* Signature Build Lab Section */}
      <BuildLab onLaunch={handleLaunchBuildLab} />

      {/* Build Lab App Launcher Modal */}
      <AppLauncherModal
        project={selectedProject}
        initialRoute={selectedInitialRoute}
        onClose={handleCloseModal}
      />
    </>
  );
}
