"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Trash2, Plus, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason?: string
}

interface DressAvailabilityCalendarProps {
  dressId: string
}

export function DressAvailabilityCalendar({ dressId }: DressAvailabilityCalendarProps) {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBlockedDates()
  }, [dressId])

  const fetchBlockedDates = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("dress_id", dressId)
        .order("start_date", { ascending: true })

      if (error) throw error

      setBlockedDates(data || [])
    } catch (error) {
      console.error("[v0] Error fetching blocked dates:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las fechas bloqueadas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockDates = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Por favor selecciona un rango de fechas",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("blocked_dates")
        .insert({
          dress_id: dressId,
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
        })
        .select()
        .single()

      if (error) throw error

      setBlockedDates((prev) => [...prev, data])
      setDateRange(undefined)
      toast({
        title: "Fechas bloqueadas",
        description: "El rango de fechas se bloqueó correctamente",
      })
    } catch (error) {
      console.error("[v0] Error blocking dates:", error)
      toast({
        title: "Error",
        description: "No se pudieron bloquear las fechas",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnblockDates = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("blocked_dates").delete().eq("id", id)

      if (error) throw error

      setBlockedDates((prev) => prev.filter((d) => d.id !== id))
      toast({
        title: "Fechas desbloqueadas",
        description: "El rango de fechas se desbloqueó correctamente",
      })
    } catch (error) {
      console.error("[v0] Error unblocking dates:", error)
      toast({
        title: "Error",
        description: "No se pudieron desbloquear las fechas",
        variant: "destructive",
      })
    }
  }

  // Function to check if a date should be disabled
  const isDateBlocked = (date: Date) => {
    return blockedDates.some((blocked) => {
      const startDate = new Date(blocked.start_date + "T00:00:00")
      const endDate = new Date(blocked.end_date + "T00:00:00")
      return isWithinInterval(date, { start: startDate, end: endDate })
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-secondary" />
        <h3 className="text-lg font-bold text-foreground">Calendario de Disponibilidad</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Seleccionar rango de fechas para bloquear</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM yyyy", { locale: es })} -{" "}
                      {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleBlockDates} disabled={isSaving || !dateRange?.from || !dateRange?.to} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Bloqueando...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Bloquear Fechas
            </>
          )}
        </Button>
      </div>

      {blockedDates.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Fechas bloqueadas ({blockedDates.length})</Label>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {blockedDates.map((blocked) => (
              <div key={blocked.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="text-sm">
                  <span className="font-medium">
                    {format(new Date(blocked.start_date + "T00:00:00"), "dd MMM yyyy", { locale: es })}
                  </span>
                  <span className="mx-2 text-muted-foreground">—</span>
                  <span className="font-medium">
                    {format(new Date(blocked.end_date + "T00:00:00"), "dd MMM yyyy", { locale: es })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnblockDates(blocked.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Alert>
        <AlertDescription className="text-sm">
          Las fechas bloqueadas aparecerán deshabilitadas en el calendario público cuando los clientes intenten
          verificar disponibilidad.
        </AlertDescription>
      </Alert>
    </div>
  )
}
