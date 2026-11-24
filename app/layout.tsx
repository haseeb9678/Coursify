
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Providers from "@/providers/Providers";
import "./globals.css";
import CustomCursor from "@/components/shared/CustomCursor";

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
      <body
        className="min-h-screen flex flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}