import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/context/auth-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sistema de Vacunación",
  description: "Sistema de gestión de vacunación para usuarios y tutores",
  generator: 'v0.dev',
  manifest: "/manifest.json", // Link to the manifest file
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
        <html lang="es" suppressHydrationWarning>
            <head>
              <meta name="theme-color" content="#000000" />
            </head>
            <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
