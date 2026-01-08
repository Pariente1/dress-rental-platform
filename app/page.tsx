import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DressCard } from "@/components/dress-card"
import { CatalogFiltersHome } from "@/components/catalog-filters-home"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Crown, Clock, Shield, Heart, Phone, Mail } from "lucide-react"
import Link from "next/link"
import type { Dress } from "@/types/dress"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: dresses, error } = await supabase
    .from("dresses")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .limit(8)

  if (error) {
    console.error("[v0] Error fetching dresses:", error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Catalog Section */}
      <section id="catalogo" className="px-4 py-16">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-secondary to-secondary golden-gradient"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-secondary"></div>
                <div className="h-2 w-2 rounded-full bg-secondary/70"></div>
                <div className="h-1 w-1 rounded-full bg-secondary"></div>
              </div>
              <div className="h-[2px] flex-1 max-w-[100px] bg-gradient-to-r from-transparent via-secondary to-transparent golden-gradient"></div>
              <p className="text-balance text-xl font-serif italic text-foreground md:text-2xl px-4">
                Explora los vestidos más elegantes en negro y dorado
              </p>
              <div className="h-[2px] flex-1 max-w-[100px] bg-gradient-to-r from-transparent via-secondary to-secondary golden-gradient"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-secondary"></div>
                <div className="h-2 w-2 rounded-full bg-secondary/70"></div>
                <div className="h-1 w-1 rounded-full bg-secondary"></div>
              </div>
              <div className="h-[2px] w-20 bg-gradient-to-r from-secondary via-secondary to-transparent golden-gradient"></div>
            </div>
          </div>

          {dresses && dresses.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dresses.map((dress: Dress) => (
                  <DressCard key={dress.id} dress={dress} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link href="/catalogo">
                  <Button size="lg" variant="outline">
                    Ver Catálogo Completo
                  </Button>
                </Link>
              </div>

              <div className="mt-8">
                <CatalogFiltersHome />
              </div>
            </>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-muted-foreground">No hay vestidos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card px-4 py-16">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <Crown className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Diseños Exclusivos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vestidos únicos y elegantes para cada ocasión especial
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Renta Flexible</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Elige el tiempo que necesites, desde un día hasta una semana
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Calidad Garantizada</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vestidos en perfectas condiciones, limpieza y cuidado profesional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="px-4 py-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <Heart className="mx-auto mb-6 h-12 w-12 text-secondary" />
            <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">Sobre Nosotros</h2>
            <p className="mb-4 text-pretty text-muted-foreground leading-relaxed">
              Somos especialistas en renta de vestidos elegantes para todas tus ocasiones especiales. Con años de
              experiencia, ofrecemos una colección cuidadosamente seleccionada de vestidos en negro y dorado, los
              colores de la elegancia por excelencia.
            </p>
            <p className="text-pretty text-muted-foreground leading-relaxed">
              Nuestro compromiso es hacer que cada mujer se sienta única y especial en su evento, brindando calidad,
              estilo y atención personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="bg-card px-4 py-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">Contáctanos</h2>
            <p className="mb-8 text-pretty text-muted-foreground leading-relaxed">
              ¿Tienes alguna pregunta o deseas hacer una reservación? Estamos aquí para ayudarte.
            </p>
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Phone className="h-5 w-5 text-secondary" />
                  <span className="text-foreground">+52 123 456 7890</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Mail className="h-5 w-5 text-secondary" />
                  <span className="text-foreground">info@rentavestidos.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
