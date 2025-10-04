import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { AuthProvider } from "@/hooks/use-auth"
import AgeVerification from "@/components/age-verification"
import WhatsAppFloat from "@/components/whatsapp-float"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezpods.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EzPods - Pods Descartáveis Premium',
    template: '%s | EzPods'
  },
  description: 'Descubra os melhores pods descartáveis do mercado. Variedade de sabores, qualidade premium e entrega rápida.',
  keywords: ['pods', 'vape', 'descartável', 'ezpods', 'sabores', 'premium'],
  authors: [{ name: 'EzPods' }],
  creator: 'EzPods',
  publisher: 'EzPods',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'EzPods',
    title: 'EzPods - Pods Descartáveis Premium',
    description: 'Descubra os melhores pods descartáveis do mercado',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'EzPods',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EzPods - Pods Descartáveis Premium',
    description: 'Descubra os melhores pods descartáveis do mercado',
    images: [`${siteUrl}/og-image.jpg`],
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
        <AuthProvider>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
              <AgeVerification />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <WhatsAppFloat />
            </ThemeProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
