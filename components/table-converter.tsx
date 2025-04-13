"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import Papa from "papaparse"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TablePreview } from "@/components/table-preview"
import { FileDown, Clipboard, RefreshCw, Loader2, Eye, Check, AlertCircle, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type FormatType = "xlsx" | "csv" | "pdf" | "json" | "markdown"

interface TableConverterProps {
  tableData: string[][]
  setTableData: (data: string[][]) => void
  pastedText: string
  setPastedText: (text: string) => void
}

export function TableConverter({ 
  tableData, 
  setTableData, 
  pastedText, 
  setPastedText 
}: TableConverterProps) {
  const [selectedFormat, setSelectedFormat] = useState<FormatType>("xlsx")
  const [activeTab, setActiveTab] = useState<"paste" | "preview">("paste")
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPasting, setIsPasting] = useState(false)
  const [showPasteHint, setShowPasteHint] = useState(true)

  // Kısayol tuşları için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+V veya Cmd+V ile yapıştırma
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        if (textareaRef.current) {
          textareaRef.current.focus()
          navigator.clipboard.readText().then(text => {
            setPastedText(text)
            handlePaste({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>)
          })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const parseTable = (text: string): string[][] => {
    try {
      // HTML tablosu kontrolü
      if (text.includes("<table") && text.includes("</table>")) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, "text/html")
        const table = doc.querySelector("table")
        
        if (!table) {
          throw new Error("Geçerli bir tablo bulunamadı")
        }

        return Array.from(table.querySelectorAll("tr")).map((row) =>
          Array.from(row.querySelectorAll("td, th")).map((cell) => cell.textContent?.trim() || "")
        )
      }

      // CSV formatı kontrolü
      if (text.includes(",")) {
        const result = Papa.parse(text)
        return result.data as string[][]
      }

      // Tab veya boşluk ile ayrılmış değerler
      const rows = text.trim().split("\n")
      return rows.map((row) => {
        // Önce tab ile böl, sonra boşluk ile böl
        const tabSplit = row.split("\t")
        if (tabSplit.length > 1) return tabSplit
        return row.split(/\s{2,}/) // İki veya daha fazla boşluk
      })
    } catch (error) {
      console.error("Tablo parse hatası:", error)
      toast.error("Tablo verisi işlenirken bir hata oluştu")
      return []
    }
  }

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setPastedText(text)
    setIsPasting(true)

    if (text.trim()) {
      const parsed = parseTable(text)
      if (parsed.length > 0 && parsed[0].length > 0) {
        setTableData(parsed)
        setActiveTab("preview")
        toast("Tablo başarıyla işlendi", {
          description: `${parsed.length} satır ve ${parsed[0].length} sütun içeren tablo işlendi.`,
          icon: <Check className="h-4 w-4" />,
          duration: 3000,
        })
      } else {
        toast("Geçerli bir tablo bulunamadı", {
          description: "Lütfen geçerli bir tablo verisi yapıştırın.",
          icon: <AlertCircle className="h-4 w-4" />,
          duration: 3000,
        })
        setTableData([])
      }
    } else {
      setTableData([])
    }

    setTimeout(() => {
      setIsPasting(false)
      setShowPasteHint(false)
    }, 1000)
  }

  const handleFormatChange = (value: string) => {
    setSelectedFormat(value as FormatType)
  }

  const convertAndDownload = async () => {
    if (tableData.length === 0) {
      toast("Dönüştürülecek tablo bulunamadı", {
        description: "Lütfen önce bir tablo yapıştırın.",
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      const headers = tableData[0]
      const rows = tableData.slice(1)
      // Dosya adı boşsa "tablio" varsayılan adını kullan
      const finalFileName = fileName.trim() || "tablio"

      switch (selectedFormat) {
        case "xlsx":
          const wb = XLSX.utils.book_new()
          const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
          XLSX.utils.book_append_sheet(wb, ws, "Table")
          XLSX.writeFile(wb, `${finalFileName}.xlsx`)
          break

        case "csv":
          const csv = Papa.unparse({
            fields: headers,
            data: rows,
          })
          downloadFile(csv, `${finalFileName}.csv`, "text/csv")
          break

        case "pdf":
          const doc = new jsPDF({
            orientation: tableData[0].length > 5 ? "l" : "p", // 5'ten fazla sütun varsa yatay
            unit: "pt",
            format: "a4",
            putOnlyUsedFonts: true,
          })

          // Roboto fontlarını ekle
          doc.addFont("/fonts/Roboto-Regular.ttf", "Roboto", "normal")
          doc.addFont("/fonts/Roboto-Bold.ttf", "Roboto", "bold")
          doc.setFont("Roboto")
          doc.setLanguage("tr")

          // Sütun genişliklerini hesapla
          const calculateColumnWidths = () => {
            const pageWidth = doc.internal.pageSize.getWidth()
            const margins = 30 // Her iki yandan toplam margin
            const availableWidth = pageWidth - margins
            
            // Her sütundaki en uzun içeriği bul
            const maxLengths = headers.map((header, colIndex) => {
              const columnValues = [header, ...rows.map(row => row[colIndex] || '')]
              return Math.max(...columnValues.map(value => value.length))
            })
            
            // Toplam uzunluğu hesapla
            const totalLength = maxLengths.reduce((sum, len) => sum + len, 0)
            
            // Her sütun için oransal genişlik hesapla
            return maxLengths.map(length => (length / totalLength) * availableWidth)
          }

          const columnWidths = calculateColumnWidths()

          // jspdf-autotable arayüzünü doğrudan kullan
          doc.autoTable({
            head: [headers],
            body: rows,
            styles: {
              font: "Roboto",
              fontSize: 9,
              cellPadding: 4,
              overflow: 'linebreak',
              halign: 'left',
              valign: 'middle',
              minCellHeight: 18,
              cellWidth: 'wrap',
              lineWidth: 0.2,
            },
            headStyles: {
              fillColor: [45, 45, 45],
              textColor: 255,
              fontSize: 9,
              fontStyle: 'bold',
              font: "Roboto",
              minCellHeight: 20,
              valign: 'middle',
            },
            alternateRowStyles: {
              fillColor: [250, 250, 250],
            },
            columnStyles: columnWidths.reduce((acc, width, index) => {
              acc[index] = { 
                cellWidth: width,
                fontSize: 8,
                font: "Roboto",
              }
              return acc
            }, {} as Record<number, unknown>),
            margin: { top: 20, right: 15, bottom: 20, left: 15 },
            didParseCell: function(data: unknown) {
              // Türkçe karakterleri düzgün göstermek için encoding
              if ((data as any).text) {
                (data as any).text = (data as any).text.map((text: string) => 
                  decodeURIComponent(encodeURIComponent(text))
                )
              }

              // Başlık hücreleri için bold font
              if ((data as any).row.index === 0) {
                (data as any).cell.styles.fontStyle = 'bold'
              }
            },
            willDrawCell: function(data: unknown) {
              // Hücre içeriğini kontrol et
              if ((data as any).cell.text) {
                const text = Array.isArray((data as any).cell.text) ? (data as any).cell.text.join(' ') : (data as any).cell.text
                // Çok uzun içerik varsa font boyutunu küçült
                if (text.length > 40) {
                  (data as any).cell.styles.fontSize = 7
                }
              }
            },
          })
          doc.save(`${finalFileName}.pdf`)
          break

        case "json":
          const jsonData = rows.map((row) => {
            const obj: Record<string, string> = {}
            headers.forEach((header, index) => {
              obj[header] = row[index] || ""
            })
            return obj
          })
          downloadFile(JSON.stringify(jsonData, null, 2), `${finalFileName}.json`, "application/json")
          break

        case "markdown":
          let mdTable = "| " + headers.join(" | ") + " |\n"
          mdTable += "| " + headers.map(() => "---").join(" | ") + " |\n"
          rows.forEach((row) => {
            mdTable += "| " + row.join(" | ") + " |\n"
          })
          downloadFile(mdTable, `${finalFileName}.md`, "text/markdown")
          break
      }

      toast("Dönüştürme başarıyla tamamlandı", {
        description: `${finalFileName}.${selectedFormat === "markdown" ? "md" : selectedFormat} dosyası indirildi.`,
        icon: <Check className="h-4 w-4" />,
        duration: 3000,
      })
    } catch (error) {
      console.error("Dönüştürme hatası:", error)
      toast("Dönüştürme sırasında bir hata oluştu", {
        description: "Lütfen tekrar deneyin.",
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setPastedText("")
    setTableData([])
    setActiveTab("paste")
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value)
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Üst Kontroller */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label htmlFor="fileName" className="text-sm font-medium text-muted-foreground">
                Dosya Adı
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={handleFileNameChange}
                  placeholder="tablio"
                  className="w-[200px]"
                />
                <span className="text-sm text-muted-foreground">
                  .{selectedFormat === "markdown" ? "md" : selectedFormat}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label htmlFor="format" className="text-sm font-medium text-muted-foreground">
                Format
              </label>
              <Select value={selectedFormat} onValueChange={handleFormatChange}>
                <SelectTrigger id="format" className="w-full sm:w-[200px]" aria-label="Format seçimi">
                  <SelectValue placeholder="Format seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx" className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <span>Excel (XLSX)</span>
                  </SelectItem>
                  <SelectItem value="csv" className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <span>CSV</span>
                  </SelectItem>
                  <SelectItem value="pdf" className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <span>PDF</span>
                  </SelectItem>
                  <SelectItem value="json" className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <span>JSON</span>
                  </SelectItem>
                  <SelectItem value="markdown" className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <span>Markdown</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 w-full sm:w-auto">
              <Button
                onClick={handleClear}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors"
                aria-label="Temizle"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Temizle</span>
              </Button>
              <Button
                onClick={convertAndDownload}
                disabled={isLoading}
                className="flex items-center gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Dönüştürülüyor...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Dönüştür ve İndir</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* İçerik Alanı */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "paste" | "preview")}>
            <TabsList className="mb-4 w-full grid grid-cols-2">
              <TabsTrigger value="paste" className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                <Clipboard className="h-3.5 w-3.5" />
                <span>Yapıştır</span>
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={tableData.length === 0} className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                <Eye className="h-3.5 w-3.5" />
                <span>Önizleme</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <TabsContent value="paste" className="mt-0">
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Web sayfasından kopyaladığınız tabloyu buraya yapıştırın..."
                      className={cn(
                        "min-h-[250px] font-mono resize-none transition-all duration-200",
                        isPasting && "ring-2 ring-primary/50"
                      )}
                      value={pastedText}
                      onChange={handlePaste}
                      aria-label="Tablo yapıştırma alanı"
                    />
                    {isPasting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {showPasteHint && (
                    <div className="text-xs text-muted-foreground animate-fade-in">
                      İpucu: Web sayfasındaki tabloyu seçin, kopyalayın (Ctrl+C) ve buraya yapıştırın (Ctrl+V).
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-md overflow-hidden">
                  <TablePreview data={tableData} format={selectedFormat} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
