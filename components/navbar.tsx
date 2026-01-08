"use client"

import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/images/isotipo-20pascal-20fondo-20negro.png"
              alt="Pascal Solutions"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold golden-gradient-text">Pascal</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/catalogo" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
            Catálogo
          </Link>
          {user && (
            <Link
              href="/admin/subir-vestido"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Admin
            </Link>
          )}
          <Link
            href="/#nosotros"
            className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
          >
            Nosotros
          </Link>
          <Link
            href="/#contacto"
            className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
          >
            Contacto
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-secondary transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
