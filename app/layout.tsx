import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { AuthProvider } from "@/hooks/use-auth"
import AgeVerification from "@/components/age-verification"
import WhatsAppFloat from "@/components/whatsapp-float"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezpods.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "EzPods - Pod SP | Vape São Paulo | Pod Perto de Mim",
  description:
    "EzPods - Loja de Pod em São Paulo. Vape, Pod, Elfbar, Ignite com entrega rápida. Pod perto de mim, pod entrega SP, vape São Paulo. Os melhores pods e vapes de SP.",
  keywords: [
    "pod sp",
    "pod são paulo",
    "vape",
    "pod perto de mim",
    "pod entrega",
    "elfbar",
    "ignite",
    "vape são paulo",
    "pod delivery",
    "cigarro eletrônico",
    "pod descartável",
    "vape shop sp",
    "pod loja",
    "ezpods",
  ],
  openGraph: {
    title: "EzPods - Pod SP | Vape São Paulo",
    description: "Os melhores pods e vapes de São Paulo com entrega rápida. Elfbar, Ignite e muito mais!",
    url: siteUrl,
    siteName: "EzPods",
    images: [
      {
        url: "/preview.jpg",
        width: 800,
        height: 800,
        alt: "EzPods - Loja de Pod e Vape em São Paulo",
      }
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EzPods - Pod SP | Vape São Paulo",
    description: "Os melhores pods e vapes de São Paulo com entrega rápida.",
    images: ["/preview.jpg"],
    creator: "@ezpods",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${montserrat.className} bg-black min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            <AuthProvider>
              <AgeVerification />
              <div className="silver-spots-container">
                <div className="silver-spot silver-spot-1"></div>
                <div className="silver-spot silver-spot-2"></div>
                <div className="silver-spot silver-spot-3"></div>
                <div className="silver-spot silver-spot-4"></div>
                <div className="silver-spot silver-spot-5"></div>
              </div>
              <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative z-10">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
                <WhatsAppFloat />
              </div>
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
