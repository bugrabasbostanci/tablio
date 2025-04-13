"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableConverter } from "@/components/table-converter"
import { SimpleGuide } from "@/components/simple-guide"
import { AboutSection } from "@/components/about-section"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [activeTab, setActiveTab] = useState("convert")
  const [tableData, setTableData] = useState<string[][]>([])
  const [pastedText, setPastedText] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="relative mb-8">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Tablio</h1>
            <p className="text-lg text-muted-foreground">
              Web tablolarını tek tıkla kullanılabilir formatlara dönüştürün
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full grid grid-cols-3 bg-muted/30 p-1 rounded-lg">
              <TabsTrigger 
                value="convert" 
                className="text-base text-muted-foreground cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Dönüştür
              </TabsTrigger>
              <TabsTrigger 
                value="guide" 
                className="text-base text-muted-foreground cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Nasıl Kullanılır?
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="text-base text-muted-foreground cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Hakkında
              </TabsTrigger>
            </TabsList>

            {activeTab === "convert" && (
              <div className="flex justify-center -mt-4 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="group relative inline-block">
                  <Badge variant="outline" className="flex items-center gap-2 cursor-help py-1.5 px-3 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    Tıklamadan CTRL+V ile Yapıştır
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                  </Badge>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85 text-popover-foreground text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border">
                    <p>Tabloyu kopyaladıktan sonra metin alanına tıklamadan direkt <span className="font-medium">CTRL+V</span> ile yapıştırabilirsiniz!</p>
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="convert" className="mt-0">
              <TableConverter 
                tableData={tableData}
                setTableData={setTableData}
                pastedText={pastedText}
                setPastedText={setPastedText}
              />
            </TabsContent>

            <TabsContent value="guide" className="mt-0">
              <SimpleGuide />
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <AboutSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
