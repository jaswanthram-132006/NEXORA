import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    template: "%s | NEXORA",
    default: "NEXORA — Master Algorithms & AI",
  },
  description:
    "An interactive learning platform for Design and Analysis of Algorithms, Principles of AI, and advanced computer science concepts. Visualize, simulate, and master complex topics.",
  keywords: [
    "algorithms",
    "DAA",
    "artificial intelligence",
    "machine learning",
    "computer science",
    "interactive learning",
    "algorithm visualization",
  ],
  openGraph: {
    title: "NEXORA — Master Algorithms & AI",
    description:
      "Interactive learning platform for algorithms and artificial intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('nexora-theme');
                  var isDark = stored ? stored === 'dark' : true;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-bg-base text-text-primary selection:bg-accent-orange/25 dark:selection:bg-[#0A84FF]/30 transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
