"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle, Menu, Bell, LogOut } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function Header() {
  const pathname = usePathname()
  const { user, logout, selectedCenter } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme() // Moved up

  // Moved useMemo hooks to be called unconditionally before any early returns
  const dashboardPath = useMemo(() => {
    if (user?.role === "Medico") {
      return "/medical/select-center";
    }
    return "/dashboard";
  }, [user]);

  const isDashboardActive = useMemo(() => {
    if (user?.role === "Medico") {
      return pathname === "/management/medical/appointments" || pathname === "/medical/select-center"
    }
    return pathname === "/dashboard"
  }, [pathname, user])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="px-10 sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-3">
            {isMounted && theme && (
              <Image
                src={theme === "light" ? "/images/logo-vacunas-rd.jpeg" : "/images/logo-vacunas-rd-dark.jpeg"}
                alt="VACUNAS RD - Logo oficial"
                width={40} 
                height={40}
                className="rounded-lg"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">VACUNAS RD</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ministerio de Salud Pública</p>
            </div>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {isMounted && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Dashboard
                    </Link>

                    {user.role === "Tutor" && (
                      <>
                        <Link
                          href="/children"
                          className={`text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${pathname === "/children" ? "text-green-600 dark:text-green-400" : ""}`}
                        >
                          Niños
                        </Link>
                        <Link
                          href="/history"
                          className={`text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${pathname === "/history" ? "text-green-600 dark:text-green-400" : ""}`}
                        >
                          Historial
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/about"
                      className={`text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${pathname === "/about" ? "text-green-600 dark:text-green-400" : ""}`}
                    >
                      Acerca de
                    </Link>
                    <Link
                      href="/contact"
                      className={`text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${pathname === "/contact" ? "text-green-600 dark:text-green-400" : ""}`}
                    >
                      Contacto
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isMounted ? (
            <>
              <ModeToggle />
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="flex items-center justify-between p-2">
                        <p className="text-sm font-medium">Notificaciones</p>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Marcar todas como leídas
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="max-h-80 overflow-y-auto">
                        <div className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones nuevas</div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <UserCircle className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Configuración</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center">
                  <Link href="/auth">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Iniciar sesión / Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : null}
          {isMounted && (
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle Menu">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
