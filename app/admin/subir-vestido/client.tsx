"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, Loader2, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLOR_OPTIONS = [
  { name: "Rojo", hex: "#DC143C" },
  { name: "Verde", hex: "#228B22" },
  { name: "Azul", hex: "#001f3f" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#000000" },
  { name: "Naranja", hex: "#FF8C00" },
  { name: "Morado", hex: "#9370DB" },
  { name: "Rosa", hex: "#FF69B4" },
  { name: "Multicolor", hex: "rainbow" },
]

export default function SubirVestidoClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [size, setSize] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [category, setCategory] = useState<string>("Sin categoría")
  const [color, setColor] = useState<string>("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no puede superar los 2MB")
      return
    }

    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validFormats.includes(file.type)) {
      alert("Formato no válido. Use JPG, JPEG, PNG o WEBP")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setErrorMessage(null)
    setErrorDetails(null)

    if (!imageFile || !name || !size || !price || !color) {
      setErrorMessage("Por favor completa todos los campos incluyendo el color")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", imageFile)

      const uploadRes = await fetch("/api/upload-dress-image", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        setErrorMessage(`Error al subir imagen: ${uploadData.error || "Error desconocido"}`)
        setErrorDetails(`Step: ${uploadData.step || "N/A"} | Details: ${uploadData.details || "N/A"}`)
        setLoading(false)
        return
      }

      const { url: imageUrl } = uploadData

      const createRes = await fetch("/api/create-dress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          size,
          price_per_day: Number(price),
          category,
          image_url: imageUrl,
          color, // Use manual color
        }),
      })

      const createData = await createRes.json()

      if (!createRes.ok) {
        setErrorMessage(`Error al crear vestido: ${createData.error || "Error desconocido"}`)
        setErrorDetails(
          `Code: ${createData.code || "N/A"} | Details: ${createData.details || "N/A"} | Hint: ${createData.hint || "N/A"}`,
        )
        setLoading(false)
        return
      }

      alert("¡Vestido agregado exitosamente!")
      router.push("/catalogo")
    } catch (error) {
      setErrorMessage("Error de conexión")
      setErrorDetails(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Agregar Nuevo Vestido</CardTitle>
              <CardDescription>Completa la información del vestido incluyendo el color.</CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                  <p className="font-semibold text-red-700">{errorMessage}</p>
                  {errorDetails && <p className="mt-2 text-sm text-red-600 font-mono break-all">{errorDetails}</p>}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Foto del vestido */}
                <div className="space-y-2">
                  <Label>Fotografía del Vestido *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {imageFile ? imageFile.name : "Seleccionar imagen"}
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setShowInfoModal(true)}>
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="h-48 w-full rounded-lg object-cover border border-border"
                      />
                    </div>
                  )}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Vestido *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      const text = e.target.value.slice(0, 50)
                      setName(text)
                    }}
                    maxLength={50}
                    placeholder="Ej: Vestido de Noche Elegante"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {name.length < 10 ? (
                        <span className="text-red-600">Mínimo 10 caracteres</span>
                      ) : (
                        <span className="text-green-600">Válido</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{name.length} / 50</p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      const text = e.target.value.slice(0, 100)
                      setDescription(text)
                    }}
                    maxLength={100}
                    placeholder="Describe las características del vestido... (máx. 100 caracteres)"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">{description.length} / 100</p>
                </div>

                <div className="space-y-2">
                  <Label>Color del Vestido *</Label>
                  <Select value={color} onValueChange={setColor} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: c.hex === "rainbow" ? undefined : c.hex,
                                background:
                                  c.hex === "rainbow"
                                    ? "linear-gradient(135deg, red, orange, yellow, green, blue, purple)"
                                    : undefined,
                              }}
                            />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Talla */}
                <div className="space-y-2">
                  <Label htmlFor="size">Talla *</Label>
                  <Select value={size} onValueChange={setSize} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una talla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Precio */}
                <div className="space-y-2">
                  <Label htmlFor="price">Precio por Día *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej: 150"
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">Incluye 2 días antes y 1 día después de gracia</p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#C49D2E] text-white"
                  disabled={loading || name.length < 10}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo vestido...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Agregar Vestido
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Requisitos de la Fotografía</DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <div>
                <p className="font-semibold text-foreground">Dimensiones recomendadas:</p>
                <p className="text-sm">Mínimo 800x1200 píxeles (proporción 2:3)</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Formatos aceptados:</p>
                <p className="text-sm">JPG, JPEG, PNG, WEBP</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Tamaño máximo:</p>
                <p className="text-sm">2 MB</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-foreground">Recomendaciones:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Usa fondo neutro o blanco</li>
                  <li>Buena iluminación natural</li>
                  <li>Muestra el vestido completo</li>
                  <li>Evita sombras y reflejos</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowInfoModal(false)}>Entendido</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
