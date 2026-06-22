import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Chatbot } from "@/components/layout/chatbot";
import { ThemeProvider } from "@/lib/theme";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Premium display font for headings, hero copy, and section titles.
// Plus Jakarta Sans has a distinctive geometric character (similar to Cal Sans)
// and renders beautifully at large sizes — chosen as our display face because
// it's free, Google-hosted, and used by Linear/Vercel-adjacent products.
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerForge AI — AI-Powered Resume Builder & Career Platform",
  description:
    "Build ATS-optimized resumes, discover your dream job, and ace interviews with AI-powered coaching. Your complete career advancement platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "CareerForge AI — Build ATS-Optimized Resumes in Minutes",
    description:
      "AI-powered resume builder with ATS scoring, job matching, and interview coaching. Trusted by professionals worldwide.",
    type: "website",
    siteName: "CareerForge AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerForge AI — AI-Powered Resume Builder",
    description: "Build ATS-optimized resumes, ace interviews, land your dream job.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    user = await getSession();
  } catch {}

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
          <Toaster richColors position="top-right" />
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
