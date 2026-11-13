import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
  metadataBase: new URL("https://shariqosmani.xyz"),
  title: "Mohd Shariq Osmani | Automation, Full Stack & AI Engineer",
  description:
    "Personal portfolio of Mohd Shariq Osmani - Automation Engineer, Full Stack Developer, and AI Systems Architect.",
  keywords: [
    "Mohd Shariq Osmani",
    "Automation Engineer",
    "Full Stack Developer",
    "AI Systems Architect",
    "AI Engineer",
    "Flutter",
    "Next.js",
    "n8n",
    "Workflow Automation",
    "TypeScript",
  ],
  authors: [{ name: "Mohd Shariq Osmani", url: "https://shariqosmani.xyz" }],
  creator: "Mohd Shariq Osmani",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Mohd Shariq Osmani | Automation, Full Stack & AI Engineer",
    description:
      "I build AI-powered software, intelligent automation systems, and cross-platform mobile applications.",
    url: "https://shariqosmani.xyz",
    siteName: "Mohd Shariq Osmani Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mohd Shariq Osmani | Automation, Full Stack & AI Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohd Shariq Osmani | Automation, Full Stack & AI Engineer",
    description:
      "I build AI-powered software, intelligent automation systems, and cross-platform mobile applications.",
    images: ["/og-image.png"],
    creator: "@mohd_shariq_osmani",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (var i = 0; i < regs.length; i++) {
                    regs[i].unregister();
                  }
                });
                if (window.caches) {
                  caches.keys().then(function(keys) {
                    for (var i = 0; i < keys.length; i++) {
                      caches.delete(keys[i]);
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
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
