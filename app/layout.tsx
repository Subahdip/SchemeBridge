import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { I18nProvider } from "@/components/i18n-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Scheme Matcher | Smart India Hackathon",
  description:
    "AI-Driven Scheme Matching for Marginalized Entrepreneurs. Get matched to the right government loan scheme in 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200`}>
        <ThemeProvider>
          <I18nProvider>
            <Navbar />
            <main className="flex-1 glow-mesh pt-16">{children}</main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
