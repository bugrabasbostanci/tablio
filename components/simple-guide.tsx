"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export function SimpleGuide() {
  const steps = [
    {
      title: "1. Tabloyu Seçin",
      description: "Web sayfasındaki tabloyu fare ile seçin. Tüm hücrelerin seçildiğinden emin olun.",
      image: "/images/guide/table-select.png",
      alt: "Tablo seçme örneği"
    },
    {
      title: "2. Tabloyu Kopyalayın",
      description: "Seçtiğiniz tabloyu CTRL+C (veya CMD+C) tuşları ile kopyalayın.",
      image: "/images/guide/table-copy.png",
      alt: "Tablo kopyalama örneği"
    },
    {
      title: "3. Tabloyu Yapıştırın",
      description: "Kopyaladığınız tabloyu metin alanına CTRL+V (veya CMD+V) tuşları ile yapıştırın.",
      image: "/images/guide/table-paste.png",
      alt: "Tablo yapıştırma örneği",
      badge: {
        text: "Hızlı Yapıştırma",
        description: "Metin alanına tıklamadan direkt CTRL+V ile yapıştırabilirsiniz"
      }
    },
    {
      title: "4. Dönüştürün",
      description: "İstediğiniz formatı seçin ve &apos;Dönüştür ve İndir&apos; butonuna tıklayın.",
      image: "/images/guide/table-convert.png",
      alt: "Tablo dönüştürme örneği"
    }
  ]

  return (
    <div className="space-y-8 p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Nasıl Kullanılır?</h2>
        <p className="text-muted-foreground">
          Tablio&apos;yu kullanmak için aşağıdaki adımları takip edin.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {steps.map((step, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden border">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  {step.badge && (
                    <div className="group relative inline-block">
                      <Badge variant="secondary" className="flex items-center gap-1 cursor-help bg-primary/10 text-primary hover:bg-primary/20">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        {step.badge.text}
                      </Badge>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-64 p-2 bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85 text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border">
                        {step.badge.description}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
