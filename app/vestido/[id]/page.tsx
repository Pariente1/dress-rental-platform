import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AvailabilityChecker } from "@/components/availability-checker"
import { ReservationForm } from "@/components/reservation-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import type { Dress } from "@/types/dress"

export default async function DressDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dress, error } = await supabase.from("dresses").select("*").eq("id", id).single()

  if (error || !dress) {
    notFound()
  }

  const typedDress = dress as Dress

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Button>
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={typedDress.image_url || "/placeholder.svg"}
                  alt={typedDress.name}
                  fill
                  className="object-cover"
                />
              </div>

              {typedDress.additional_images && typedDress.additional_images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {typedDress.additional_images.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${typedDress.name} - ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">{typedDress.name}</h1>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {typedDress.category}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Talla {typedDress.size}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {typedDress.color}
                  </Badge>
                  {typedDress.available && (
                    <Badge variant="default" className="bg-secondary text-secondary-foreground">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Disponible
                    </Badge>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-2 text-sm text-muted-foreground">Precio por día</div>
                <div className="text-3xl font-bold text-secondary">${typedDress.price_per_day}</div>
              </div>

              {typedDress.description && (
                <div>
                  <h2 className="mb-3 text-xl font-bold text-foreground">Descripción</h2>
                  <p className="text-pretty text-muted-foreground leading-relaxed">{typedDress.description}</p>
                </div>
              )}

              {typedDress.available ? (
                <>
                  <AvailabilityChecker dressId={typedDress.id} pricePerDay={typedDress.price_per_day} />
                  <ReservationForm
                    dressId={typedDress.id}
                    dressName={typedDress.name}
                    pricePerDay={typedDress.price_per_day}
                  />
                </>
              ) : (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
                  <p className="font-semibold text-destructive">Este vestido no está disponible actualmente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
