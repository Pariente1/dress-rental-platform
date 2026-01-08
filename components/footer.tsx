import Link from "next/link"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">Renta de Vestidos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Los vestidos más elegantes para tus eventos especiales. Calidad y estilo garantizado.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 golden-gradient-text" />
                <span>+52 667 201 6415</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 golden-gradient-text" />
                <span>ventas@pascalsolutionsti.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">Síguenos</h3>
            <div className="flex gap-4">
              <Link
                href="https://www.facebook.com/pascalsolutionsti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/pascalsolutionsti/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>
            Página hecha por: <span className="golden-gradient-text font-semibold">© 2026 Pascal Solutions TI</span> ·
            Soporte:{" "}
            <a href="mailto:ventas@pascalsolutionsti.com" className="hover:text-secondary transition-colors">
              ventas@pascalsolutionsti.com
            </a>{" "}
            ·{" "}
            <a href="tel:+526672016415" className="hover:text-secondary transition-colors">
              +52 667 201 6415
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
