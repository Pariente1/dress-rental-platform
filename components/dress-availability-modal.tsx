"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, XCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { isWithinInterval, addDays, addYears, format } from "date-fns"
import { es } from "date-fns/locale"
import type { Dress } from "@/types/dress"
import { createClient } from "@/lib/supabase/client"

interface DressAvailabilityModalProps {
  dress: Dress
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getRandomGoldenGradient = () => {
  const gradients = [
    "golden-gradient-1",
    "golden-gradient-2",
    "golden-gradient-3",
    "golden-gradient-4",
    "golden-gradient-5",
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

export function DressAvailabilityModal({ dress, open, onOpenChange }: DressAvailabilityModalProps) {
  const [eventDate, setEventDate] = useState<Date | undefined>()
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [gradientClass] = useState(getRandomGoldenGradient())
  const [blockedDates, setBlockedDates] = useState<Array<{ start_date: string; end_date: string }>>([])
  const [dateError, setDateError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchBlockedDates()
    }
  }, [open, dress.id])

  const fetchBlockedDates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("blocked_dates").select("*").eq("dress_id", dress.id)

      if (error) throw error

      setBlockedDates(data || [])
    } catch (error) {
      console.error("[v0] Error fetching blocked dates:", error)
    }
  }

  const isDateBlocked = (date: Date) => {
    return blockedDates.some((blocked) => {
      const startDate = new Date(blocked.start_date + "T00:00:00")
      const endDate = new Date(blocked.end_date + "T00:00:00")
      return isWithinInterval(date, { start: startDate, end: endDate })
    })
  }

  const getMinDate = () => addDays(new Date(), 2)

  const getMaxDate = () => addYears(new Date(), 2)

  const validateSelectedDate = (date: Date | undefined) => {
    if (!date) {
      setDateError(null)
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minDate = getMinDate()
    const maxDate = getMaxDate()
    const currentYear = today.getFullYear()

    if (date < minDate) {
      setDateError("No se pueden consultar vestidos de fechas anteriores al día de hoy")
      return false
    }

    if (date > maxDate) {
      setDateError(`No se pueden consultar vestidos de ${currentYear + 2} o posteriores`)
      return false
    }

    setDateError(null)
    return true
  }

  const handleDateSelect = (date: Date | undefined) => {
    setEventDate(date)
    setIsAvailable(false)
    setAvailabilityMessage(null)
    validateSelectedDate(date)
  }

  const handleCheckAvailability = async () => {
    if (!eventDate) {
      setAvailabilityMessage("Por favor selecciona la fecha del evento")
      setIsAvailable(false)
      return
    }

    if (!validateSelectedDate(eventDate)) {
      return
    }

    setIsChecking(true)
    setAvailabilityMessage(null)
    setIsAvailable(false)

    try {
      const response = await fetch("/api/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dressId: dress.id,
          eventDate: format(eventDate, "yyyy-MM-dd"),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAvailable(data.available)
        setAvailabilityMessage(data.message)
      } else {
        setIsAvailable(false)
        setAvailabilityMessage(data.error || data.details || "Error al verificar disponibilidad")
      }
    } catch (error) {
      console.error("[v0] Error checking availability:", error)
      setIsAvailable(false)
      setAvailabilityMessage(`Error de conexión: ${error instanceof Error ? error.message : "Intenta de nuevo"}`)
    } finally {
      setIsChecking(false)
    }
  }

  const handleClose = () => {
    setEventDate(undefined)
    setIsAvailable(false)
    setAvailabilityMessage(null)
    setDateError(null)
    onOpenChange(false)
  }

  const whatsappMessage = `Hola, me interesa reservar el vestido "${dress.name}" para el ${eventDate ? format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: es }) : "mi evento"}.`
  const whatsappLink = `https://wa.me/526672016415?text=${encodeURIComponent(whatsappMessage)}`

  const isButtonDisabled = isChecking || !eventDate || dateError !== null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{dress.name}</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">${dress.price_per_day}</span> • {dress.category} •{" "}
            {dress.size}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {dress.description && (
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground text-sm">Descripción</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{dress.description}</p>
            </div>
          )}

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-secondary" />
              <h3 className="text-base font-bold text-foreground">Verificar Disponibilidad</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Fecha del evento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const minDate = getMinDate()
                        const maxDate = getMaxDate()
                        if (date < minDate) return true
                        if (date > maxDate) return true
                        return isDateBlocked(date)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Las reservas deben hacerse con al menos 2 días de anticipación (máximo 2 años). Las fechas
                  deshabilitadas no están disponibles.
                </p>
              </div>

              {dateError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{dateError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCheckAvailability}
                disabled={isButtonDisabled}
                className={`w-full ${gradientClass} text-black hover:opacity-90 disabled:opacity-50`}
              >
                {isChecking ? (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Revisar Disponibilidad"
                )}
              </Button>

              {availabilityMessage && (
                <Alert
                  variant={isAvailable ? "default" : "destructive"}
                  className={isAvailable ? "bg-green-500/10 border-green-500/50" : ""}
                >
                  {isAvailable ? <CalendarIcon className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription className={isAvailable ? "text-green-600 font-semibold" : ""}>
                    {availabilityMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {isAvailable && eventDate && (
            <div className="space-y-4 rounded-lg border border-secondary/30 bg-secondary/5 p-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <CalendarIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900/80">
                    <span className="font-semibold">Nota:</span> El precio es por día, pero se dan de gracia 2 días
                    antes (para recogida y ajustes) y 1 día después (para devolución).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-secondary" />
                    Fechas importantes
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Recogida:</span> A partir del{" "}
                      <span className="golden-gradient-text font-semibold">
                        {format(addDays(eventDate, -2), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Devolución:</span> A más tardar el{" "}
                      <span className="golden-gradient-text font-semibold">
                        {format(addDays(eventDate, 1), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-secondary" />
                    Reservar por WhatsApp
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Para confirmar tu reservación, contáctanos vía WhatsApp:
                  </p>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      Enviar WhatsApp al 667-201-6415
                    </a>
                  </Button>
                </div>

                <div className="bg-background rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-secondary" />
                    Visita nuestra sucursal
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Dirección:</span>
                    <br />
                    Calle Conchita Col. Aguas #123
                    <br />
                    Culiacán, Sinaloa
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
