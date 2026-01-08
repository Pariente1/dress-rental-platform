"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface AvailabilityCheckerProps {
  dressId: string
  pricePerDay: number
}

export function AvailabilityChecker({ dressId, pricePerDay }: AvailabilityCheckerProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean
    message: string
  } | null>(null)

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailability({
        available: false,
        message: "Por favor selecciona ambas fechas",
      })
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setAvailability({
        available: false,
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
      })
      return
    }

    setIsChecking(true)
    setAvailability(null)

    try {
      const response = await fetch("/api/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dressId, startDate, endDate }),
      })

      const data = await response.json()

      if (response.ok) {
        setAvailability({
          available: data.available,
          message: data.message,
        })
      } else {
        setAvailability({
          available: false,
          message: data.error || "Error al verificar disponibilidad",
        })
      }
    } catch (error) {
      console.error("[v0] Error checking availability:", error)
      setAvailability({
        available: false,
        message: "Error al verificar disponibilidad. Intenta de nuevo.",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const days = calculateDays()
  const totalPrice = days * pricePerDay

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-secondary" />
        <h3 className="text-lg font-bold text-foreground">Verificar Disponibilidad</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-date">Fecha de inicio</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Fecha de fin</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {days > 0 && (
          <div className="rounded-lg bg-secondary/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {days} {days === 1 ? "día" : "días"} de renta
              </span>
              <span className="text-lg font-bold text-secondary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button onClick={handleCheckAvailability} disabled={isChecking} className="w-full" size="lg">
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Revisar Disponibilidad"
          )}
        </Button>

        {availability && (
          <Alert variant={availability.available ? "default" : "destructive"}>
            {availability.available ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{availability.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
