import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import AgeVerification from "@/components/age-verification"
import WhatsAppFloat from "@/components/whatsapp-float"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
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
    images: ["/ezpods-logo.png"],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EzPods - Pod SP | Vape São Paulo",
    description: "Os melhores pods e vapes de São Paulo com entrega rápida.",
    images: ["/ezpods-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${montserrat.className} bg-black min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
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
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
