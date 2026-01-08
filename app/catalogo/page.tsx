"use client"

import { Suspense, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogContent } from "@/components/catalog-content"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function CatalogoPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          setIsAdmin(false)
          return
        }

        setIsAdmin(true)
      } catch (err) {
        console.error("[v0] Auth check error:", err)
        setIsAdmin(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">Catálogo Completo</h1>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Explora nuestra colección completa de vestidos elegantes
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-mode"
                  checked={editMode}
                  onCheckedChange={setEditMode}
                  className="data-[state=checked]:bg-secondary"
                />
                <Label htmlFor="edit-mode" className="cursor-pointer font-semibold text-foreground">
                  Modo Edición
                </Label>
              </div>
            )}
          </div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-muted" />}>
              <CatalogFilters />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            }
          >
            <CatalogContent editMode={editMode} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
