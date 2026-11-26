
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Providers from "@/providers/Providers";
import "./globals.css";
import CustomCursor from "@/components/shared/CustomCursor";
import AuthProvider from "@/providers/auth-provider";

const accessibilityPreferenceBootstrap = `(() => {
  try {
    const raw = localStorage.getItem("coursify-accessibility-preferences");
    const saved = raw ? JSON.parse(raw)?.state : null;
    const root = document.documentElement;
    const allowedScales = [100, 112.5, 125, 150, 200];
    const scale = allowedScales.includes(saved?.fontScale) ? saved.fontScale : 100;
    root.dataset.fontScale = String(scale);
    root.dataset.highContrast = String(saved?.highContrast === true);
    root.dataset.textSpacing = String(saved?.textSpacing === true);
    root.dataset.highlightLinks = String(saved?.highlightLinks === true);
    root.dataset.reduceMotion = String(saved?.reduceMotion === true);
    root.dataset.readableFont = String(saved?.readableFont === true);
    root.dataset.enhancedFocus = String(saved?.enhancedFocus === true);
  } catch (error) {
    console.error("Could not initialize saved accessibility preferences.", error);
  }
})();`;

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Coursify | Learn Without Limits",
    template: "%s | Coursify",
  },
  description:
    "Discover professional courses, learn from expert instructors, and build skills with Coursify.",
  applicationName: "Coursify",
  keywords: [
    "Coursify",
    "Online Courses",
    "E-Learning",
    "Online Learning Platform",
    "Professional Courses",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: accessibilityPreferenceBootstrap,
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
        <AuthProvider>
          
            {children}
            
           </AuthProvider>
          </Providers>
      </body>
    </html>
  );
}