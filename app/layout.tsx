import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tablio - Web Tablolarını Dönüştür",
  description: "Web tablolarını tek tıkla kullanılabilir formatlara dönüştürün",
  icons: {
    icon: [
      { 
        url: "/images/tablio-logo.svg",
        type: "image/svg+xml",
        sizes: "any" 
      },
      { 
        url: "/images/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32" 
      },
      { 
        url: "/images/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16" 
      },
      { 
        url: "/images/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192" 
      },
      { 
        url: "/images/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512" 
      }
    ],
    shortcut: { 
      url: "/images/favicon-32x32.png",
      type: "image/png" 
    },
    apple: {
      url: "/images/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180"
    }
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.375rem",
                padding: "1rem",
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
              },
              className: "toast",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
