export interface Dress {
  id: string
  name: string
  description: string | null
  category: string
  color: string
  size: string
  price_per_day: number
  image_url: string
  additional_images: string[] | null
  available: boolean
  created_at: string
  updated_at: string
}
