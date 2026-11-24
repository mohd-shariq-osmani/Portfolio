import Hero from "@/components/hero/Hero";
import InteractiveProjectsSection from "@/components/build-lab/InteractiveProjectsSection";
import AutomationSection from "@/components/automation/AutomationSection";
import AboutSection from "@/components/about/AboutSection";
import ContactSection from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <div className="w-full bg-black text-white min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured iPhone Projects Showcase & Signature Build Lab */}
      <InteractiveProjectsSection />

      {/* Automation Systems Section (n8n inspired) */}
      <AutomationSection />

      {/* About & Tech Grid Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
