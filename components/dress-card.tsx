"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DressAvailabilityModal } from "@/components/dress-availability-modal"
import { Camera, Trash2, Loader2 } from "lucide-react"
import type { Dress } from "@/types/dress"
import { useToast } from "@/hooks/use-toast"
import { DressAvailabilityCalendar } from "@/components/dress-availability-calendar"
import { ColorSelector } from "@/components/color-selector"
import { CreatableSelect } from "@/components/creatable-select"

interface DressCardProps {
  dress: Dress
  editMode?: boolean
  onUpdate?: (dress: Dress) => void
  onDelete?: (dressId: string) => void
}

const GOLDEN_GRADIENTS = [
  "golden-gradient-1",
  "golden-gradient-2",
  "golden-gradient-3",
  "golden-gradient-4",
  "golden-gradient-5",
]

const getGradientForDress = (dressId: string) => {
  let hash = 0
  for (let i = 0; i < dressId.length; i++) {
    hash = dressId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return GOLDEN_GRADIENTS[Math.abs(hash) % GOLDEN_GRADIENTS.length]
}

export function DressCard({ dress, editMode = false, onUpdate, onDelete }: DressCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const gradientClass = getGradientForDress(dress.id)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageHover, setImageHover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Editable fields
  const [editedName, setEditedName] = useState(dress.name)
  const [editedDescription, setEditedDescription] = useState(dress.description || "")
  const [editedPrice, setEditedPrice] = useState(dress.price_per_day.toString())
  const [editedSize, setEditedSize] = useState(dress.size)
  const [editedColor, setEditedColor] = useState(dress.color || "")
  const [newImage, setNewImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [sizeOptions, setSizeOptions] = useState<string[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/get-dress-options")
        const data = await response.json()
        if (data.sizes) {
          setSizeOptions(data.sizes.map((s: { name: string }) => s.name))
        }
      } catch (error) {
        console.error("[v0] Error loading options:", error)
        setSizeOptions(["XS", "S", "M", "L", "XL", "XXL"])
      } finally {
        setIsLoadingOptions(false)
      }
    }
    if (editMode) {
      fetchOptions()
    }
  }, [editMode])

  const handleAddOption = async (type: "size" | "category", newValue: string) => {
    try {
      const response = await fetch("/api/add-dress-option", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name: newValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Error adding option:", errorData)
        toast({
          title: "Error",
          description: `No se pudo agregar la opción: ${errorData.details || errorData.error}`,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Opción agregada",
        description: `"${newValue}" se agregó correctamente y estará disponible para todos los vestidos`,
      })
      return true
    } catch (error) {
      console.error("[v0] Error adding option:", error)
      return false
    }
  }

  const handleSizeOptionsChange = async (newOptions: string[]) => {
    const addedOption = newOptions.find((opt) => !sizeOptions.includes(opt))
    if (addedOption) {
      const success = await handleAddOption("size", addedOption)
      if (success) {
        setSizeOptions(newOptions)
      }
    } else {
      setSizeOptions(newOptions)
    }
  }

  const handleImageClick = () => {
    if (editMode) {
      fileInputRef.current?.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 2MB",
          variant: "destructive",
        })
        return
      }
      setNewImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let imageUrl = dress.image_url

      if (newImage) {
        const formData = new FormData()
        formData.append("file", newImage)

        const uploadRes = await fetch("/api/upload-dress-image", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json()
          throw new Error(errorData.error || "Error al subir la imagen")
        }

        const { url } = await uploadRes.json()
        imageUrl = url
      }

      const response = await fetch("/api/update-dress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dress.id,
          name: editedName,
          description: editedDescription,
          price_per_day: Number(editedPrice),
          size: editedSize,
          color: editedColor,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el vestido")
      }

      const { dress: updatedDress } = await response.json()

      toast({
        title: "Cambios guardados",
        description: "El vestido se actualizó correctamente",
      })

      setNewImage(null)
      setPreviewImage(null)
      onUpdate?.(updatedDress)
    } catch (error) {
      console.error("[v0] Error saving dress:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este vestido?")) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/delete-dress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dress.id }),
      })

      if (!response.ok) throw new Error("Error al eliminar el vestido")

      toast({
        title: "Vestido eliminado",
        description: "El vestido se eliminó correctamente",
      })

      onDelete?.(dress.id)
    } catch (error) {
      console.error("[v0] Error deleting dress:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el vestido",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-secondary/50 flex flex-col h-full">
        {editMode && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-2 text-white shadow-lg transition-opacity hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        )}

        <div
          className={`relative aspect-[2/3] overflow-hidden bg-muted ${editMode ? "cursor-pointer" : ""}`}
          onMouseEnter={() => editMode && setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}
          onClick={handleImageClick}
        >
          <Image
            src={previewImage || dress.image_url || "/placeholder.svg"}
            alt={dress.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {!dress.available && !editMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Badge variant="destructive" className="text-base">
                No Disponible
              </Badge>
            </div>
          )}
          {editMode && imageHover && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Camera className="h-12 w-12 text-white" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <CardContent className="p-4 space-y-3 flex flex-col flex-grow justify-between">
          <div className="space-y-3">
            {editMode ? (
              <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-lg font-bold" />
            ) : (
              <h3 className="text-lg font-bold text-foreground line-clamp-1">{dress.name}</h3>
            )}

            {editMode ? (
              <CreatableSelect
                value={editedSize}
                onChange={(val) => setEditedSize(val as string)}
                options={sizeOptions}
                onOptionsChange={handleSizeOptionsChange}
                placeholder="Talla"
                multiple={false}
                allowCreate={true}
                allowDelete={false}
                className="w-24 text-xs"
              />
            ) : (
              <Badge variant="outline" className="text-xs">
                {dress.size}
              </Badge>
            )}

            {editMode ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => {
                  const text = e.target.value.slice(0, 100)
                  setEditedDescription(text)
                }}
                maxLength={100}
                className="text-sm min-h-[60px]"
                placeholder="Descripción (máx. 100 caracteres)"
              />
            ) : (
              <p className="text-xs md:text-sm lg:text-xs text-muted-foreground line-clamp-2 min-h-[3rem] overflow-hidden">
                {dress.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              {editMode ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Color:</span>
                  <ColorSelector value={editedColor} onChange={setEditedColor} className="w-32" />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Color: {dress.color}</span>
              )}
              {editMode ? (
                <Input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="w-24 text-right text-lg font-bold"
                />
              ) : (
                <span className="text-lg font-bold text-foreground">${dress.price_per_day}</span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-3">
            {editMode ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>

                <div className="mt-4">
                  <DressAvailabilityCalendar dressId={dress.id} />
                </div>
              </>
            ) : (
              <Button
                onClick={() => setModalOpen(true)}
                disabled={!dress.available}
                className={`w-full ${gradientClass} text-black hover:opacity-90`}
              >
                Verificar Disponibilidad
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DressAvailabilityModal dress={dress} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
