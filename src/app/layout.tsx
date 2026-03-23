import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import {
  OrganizationStructuredDataWrapper,
  WebsiteStructuredDataWrapper,
} from "@/components/seo/structured-data-wrapper";
import { PerformanceMonitor } from "@/components/seo/performance-monitor";
import { getCompanySettings } from "@/lib/company-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const companySettings = await getCompanySettings();

  return {
    title: {
      default: companySettings.companyName,
      template: `%s | ${companySettings.companyName}`,
    },
    description: companySettings.companyDescription,
    keywords: ["blog", "modern", "nextjs", "company"],
    authors: [{ name: companySettings.companyName }],
    creator: companySettings.companyName,
    publisher: companySettings.companyName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ),
    alternates: {
      canonical: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      title: companySettings.companyName,
      description: companySettings.companyDescription,
      siteName: companySettings.companyName,
      images: [
        {
          url: companySettings.companyLogo || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: companySettings.companyName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: companySettings.companyName,
      description: companySettings.companyDescription,
      images: [companySettings.companyLogo || "/og-image.jpg"],
      creator: companySettings.twitterUrl
        ? `@${companySettings.twitterUrl.split("/").pop()}`
        : "",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const companySettings = await getCompanySettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <OrganizationStructuredDataWrapper />
        <WebsiteStructuredDataWrapper />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --company-primary: ${companySettings.primaryColor};
              --company-secondary: ${companySettings.secondaryColor};
              --company-accent: ${companySettings.accentColor};
            }
          `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <PerformanceMonitor enabled={process.env.NODE_ENV === "production"}>
          <SessionProvider>{children}</SessionProvider>
        </PerformanceMonitor>
      </body>
    </html>
  );
}
