import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SubirVestidoClient from "./client"

export default async function SubirVestidoPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return <SubirVestidoClient />
}
