import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mohd Shariq Osmani | Automation, Full Stack & AI Engineer",
  description:
    "Award-quality personal portfolio of Mohd Shariq Osmani - Automation Engineer, Full Stack Developer, and AI Systems Architect.",
  keywords: [
    "Mohd Shariq Osmani",
    "Automation Engineer",
    "Full Stack Developer",
    "AI Engineer",
    "Flutter",
    "Next.js",
    "n8n",
  ],
  authors: [{ name: "Mohd Shariq Osmani" }],
  openGraph: {
    title: "Mohd Shariq Osmani | Award-Quality Portfolio",
    description: "I build AI-powered software, intelligent automation systems, and cross-platform mobile applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-black text-white antialiased selection:bg-white selection:text-black">
        <SmoothScroll>
          <Header />
          <main className="w-full flex flex-col min-h-screen">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
