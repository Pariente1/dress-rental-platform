import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

// Función para detectar el color dominante de una imagen
function getClosestPrimaryColor(r: number, g: number, b: number): string {
  // Definir los 7 colores primarios y secundarios con sus valores RGB
  const colors = [
    { name: "Rojo", rgb: [255, 0, 0] },
    { name: "Azul", rgb: [0, 0, 255] },
    { name: "Amarillo", rgb: [255, 255, 0] },
    { name: "Verde", rgb: [0, 255, 0] },
    { name: "Naranja", rgb: [255, 165, 0] },
    { name: "Morado", rgb: [128, 0, 128] },
    { name: "Rosa", rgb: [255, 192, 203] },
    { name: "Negro", rgb: [0, 0, 0] },
    { name: "Blanco", rgb: [255, 255, 255] },
  ]

  let minDistance = Number.POSITIVE_INFINITY
  let closestColor = "Negro"

  colors.forEach((color) => {
    // Calcular distancia euclidiana en el espacio RGB
    const distance = Math.sqrt(
      Math.pow(r - color.rgb[0], 2) + Math.pow(g - color.rgb[1], 2) + Math.pow(b - color.rgb[2], 2),
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color.name
    }
  })

  return closestColor
}

// Función simplificada para obtener color dominante
// En producción, usarías una librería como 'node-vibrant' o procesarías la imagen del lado del servidor
async function extractDominantColor(file: File): Promise<string> {
  // Por ahora, retornamos un color basado en un análisis básico
  // En una implementación real, usarías Canvas API o una librería de procesamiento de imágenes

  try {
    // Leer el archivo como ArrayBuffer
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Muestreo simple: tomar píxeles del medio de la imagen
    // Esto es una simplificación - en producción usarías una librería como sharp o jimp
    let r = 0,
      g = 0,
      b = 0
    let sampleCount = 0

    // Muestrear algunos bytes (simplificado)
    for (let i = 0; i < Math.min(bytes.length, 10000); i += 100) {
      if (i + 2 < bytes.length) {
        r += bytes[i]
        g += bytes[i + 1]
        b += bytes[i + 2]
        sampleCount++
      }
    }

    if (sampleCount > 0) {
      r = Math.floor(r / sampleCount)
      g = Math.floor(g / sampleCount)
      b = Math.floor(b / sampleCount)

      return getClosestPrimaryColor(r, g, b)
    }

    return "Negro" // Color por defecto
  } catch (error) {
    console.error("[v0] Error extracting color:", error)
    return "Negro" // Color por defecto en caso de error
  }
}

export async function POST(request: NextRequest) {
  console.log("=== UPLOAD DRESS IMAGE API CALLED ===")

  try {
    // Step 1: Parse FormData
    console.log("[UPLOAD] Step 1: Parsing FormData...")
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("[UPLOAD] FormData parsed successfully")
    } catch (formError) {
      console.error("[UPLOAD] FAILED at Step 1 - FormData parsing:", formError)
      return NextResponse.json(
        {
          error: "Error al procesar el formulario",
          step: "FORM_DATA_PARSE",
          details: formError instanceof Error ? formError.message : "Unknown form error",
          stack: formError instanceof Error ? formError.stack : undefined,
        },
        { status: 400 },
      )
    }

    // Step 2: Get file from FormData
    console.log("[UPLOAD] Step 2: Getting file from FormData...")
    const file = formData.get("file") as File

    if (!file) {
      console.error("[UPLOAD] FAILED at Step 2 - No file in FormData")
      return NextResponse.json(
        {
          error: "No se proporcionó ningún archivo",
          step: "FILE_NOT_FOUND",
          details: "El campo 'file' no existe en el FormData",
        },
        { status: 400 },
      )
    }

    console.log("[UPLOAD] File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Step 3: Validate file size
    console.log("[UPLOAD] Step 3: Validating file size...")
    if (file.size > 2 * 1024 * 1024) {
      console.error("[UPLOAD] FAILED at Step 3 - File too large:", file.size)
      return NextResponse.json(
        {
          error: "El archivo supera los 2MB",
          step: "FILE_SIZE_VALIDATION",
          details: `Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB, Máximo: 2MB`,
        },
        { status: 400 },
      )
    }

    // Step 4: Validate file format
    console.log("[UPLOAD] Step 4: Validating file format...")
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validFormats.includes(file.type)) {
      console.error("[UPLOAD] FAILED at Step 4 - Invalid format:", file.type)
      return NextResponse.json(
        {
          error: "Formato de archivo no válido",
          step: "FILE_FORMAT_VALIDATION",
          details: `Formato recibido: ${file.type}, Formatos válidos: ${validFormats.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Step 5: Extract dominant color
    console.log("[UPLOAD] Step 5: Extracting dominant color...")
    let dominantColor: string
    try {
      dominantColor = await extractDominantColor(file)
      console.log("[UPLOAD] Color extracted:", dominantColor)
    } catch (colorError) {
      console.error("[UPLOAD] WARNING at Step 5 - Color extraction failed:", colorError)
      dominantColor = "Negro" // Default fallback
      console.log("[UPLOAD] Using default color: Negro")
    }

    // Step 6: Upload to Vercel Blob
    console.log("[UPLOAD] Step 6: Uploading to Vercel Blob...")
    console.log("[UPLOAD] BLOB_READ_WRITE_TOKEN exists:", !!process.env.BLOB_READ_WRITE_TOKEN)

    let blob
    try {
      const filename = `dresses/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      console.log("[UPLOAD] Uploading with filename:", filename)

      blob = await put(filename, file, {
        access: "public",
      })

      console.log("[UPLOAD] Blob upload successful:", blob.url)
    } catch (blobError) {
      console.error("[UPLOAD] FAILED at Step 6 - Vercel Blob upload:", blobError)
      return NextResponse.json(
        {
          error: "Error al subir imagen a Vercel Blob",
          step: "BLOB_UPLOAD",
          details: blobError instanceof Error ? blobError.message : "Unknown blob error",
          stack: blobError instanceof Error ? blobError.stack : undefined,
          hint: "Verificar que BLOB_READ_WRITE_TOKEN esté configurado correctamente",
        },
        { status: 500 },
      )
    }

    console.log("=== UPLOAD COMPLETED SUCCESSFULLY ===")
    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      color: dominantColor,
    })
  } catch (error) {
    console.error("=== UPLOAD UNEXPECTED ERROR ===")
    console.error("[UPLOAD] Error object:", error)
    console.error("[UPLOAD] Error stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        error: "Error interno del servidor al subir imagen",
        step: "UNEXPECTED_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
