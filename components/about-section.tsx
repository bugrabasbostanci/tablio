import { Card, CardContent } from "@/components/ui/card"
import { Github } from "lucide-react"
import Link from "next/link"

export function AboutSection() {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-4">Tablio Hakkında</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Nedir?</h3>
            <p className="text-sm text-muted-foreground">
              Tablio, web sayfalarındaki tabloları kolayca Excel, CSV, PDF, JSON ve Markdown formatlarına dönüştürmenizi
              sağlayan kullanıcı dostu bir araçtır. Herhangi bir web sitesindeki tabloyu seçip kopyalayın, Tablio&apos;ya
              yapıştırın ve istediğiniz formatta indirin.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Özellikler</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Web sayfalarından kopyalanan tabloları destekler</li>
              <li>Birden fazla format seçeneği (Excel, CSV, PDF, JSON, Markdown)</li>
              <li>Anlık önizleme</li>
              <li>Kolay kullanım</li>
              <li>Hızlı dönüştürme</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Link href="https://github.com/bugrabasbostanci/tablio" target="_blank" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                <p className="text-sm text-muted-foreground">Github</p>
              
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
