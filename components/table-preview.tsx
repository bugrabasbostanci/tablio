import { Button } from "@/components/ui/button"
import { Copy, Check, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { marked } from "marked"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { cn } from "@/lib/utils"

// jsPDF ile autoTable kullanımı için tip tanımı
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

// Tip tanımlamaları
interface AutoTableOptions {
  head?: string[][];
  body?: string[][];
  styles?: {
    font?: string;
    fontSize?: number;
    cellPadding?: number;
    overflow?: string;
    halign?: string;
    valign?: string;
    minCellHeight?: number;
    cellWidth?: string;
    lineWidth?: number;
  };
  headStyles?: {
    fillColor?: number[];
    textColor?: number;
    fontSize?: number;
    fontStyle?: string;
    font?: string;
    minCellHeight?: number;
    valign?: string;
  };
  alternateRowStyles?: {
    fillColor?: number[];
  };
  columnStyles?: Record<number, CellStyle>;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  didParseCell?: (data: CellHookData) => void;
  willDrawCell?: (data: CellHookData) => void;
}

interface CellStyle {
  cellWidth?: number;
  fontSize?: number;
  font?: string;
  fontStyle?: string;
}

interface CellHookData {
  cell: {
    text?: string | string[];
    styles: CellStyle;
  };
  row: {
    index: number;
  };
  text?: string[];
}

type FormatType = "xlsx" | "csv" | "pdf" | "json" | "markdown"

interface TablePreviewProps {
  data: string[][]
  format: FormatType
}

export function TablePreview({ data, format }: TablePreviewProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [mdContent, setMdContent] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Tam ekran modundan çıkış için event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (format === "markdown" && data.length > 0) {
      let content = ""
      
      // Tablo başlangıcı
      if (data.length > 0) {
        // Başlık satırı
        content += "| " + data[0].map(header => 
          header.replace(/\|/g, "\\|").replace(/-/g, "\\-")
        ).join(" | ") + " |\n"

        // Ayırıcı satır
        content += "| " + data[0].map(() => "---").join(" | ") + " |\n"

        // Veri satırları
        data.slice(1).forEach(row => {
          content += "| " + row.map((cell) => {
            if (!cell || cell.trim() === "") return " "
            return cell
              .toString()
              .replace(/\|/g, "\\|")
              .replace(/\n/g, "<br>")
              .replace(/-/g, "\\-")
          }).join(" | ") + " |\n"
        })
      }

      setMdContent(content)

      // HTML önizleme için dönüştür
      const customStyles = `
        <style>
          :root {
            color-scheme: light dark;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 0.9em;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          @media (prefers-color-scheme: dark) {
            table {
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            }
          }
          th {
            background-color: hsl(var(--muted));
            color: hsl(var(--foreground));
            font-weight: 600;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid hsl(var(--border));
          }
          td {
            padding: 12px;
            border-bottom: 1px solid hsl(var(--border));
          }
          tr:nth-child(even) {
            background-color: hsl(var(--muted));
          }
          tr:hover {
            background-color: hsl(var(--accent));
          }
          @media (prefers-color-scheme: dark) {
            th {
              background-color: hsl(var(--muted));
              border-bottom: 2px solid hsl(var(--border));
            }
            td {
              border-bottom: 1px solid hsl(var(--border));
            }
            tr:nth-child(even) {
              background-color: hsl(var(--muted));
            }
            tr:hover {
              background-color: hsl(var(--accent));
            }
          }
        </style>
      `
      const html = customStyles + marked(content)
      setHtmlContent(html)
    }

    if (format === "pdf" && data.length > 0) {
      const generatePDFPreview = async () => {
        try {
          const doc = new jsPDF({
            orientation: data[0].length > 5 ? "l" : "p", // 5'ten fazla sütun varsa yatay
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
            const maxLengths = data[0].map((header, colIndex) => {
              const columnValues = [header, ...data.slice(1).map(row => row[colIndex] || '')]
              return Math.max(...columnValues.map(value => value.length))
            })
            
            // Toplam uzunluğu hesapla
            const totalLength = maxLengths.reduce((sum, len) => sum + len, 0)
            
            // Her sütun için oransal genişlik hesapla
            return maxLengths.map(length => (length / totalLength) * availableWidth)
          }

          const columnWidths = calculateColumnWidths()
          
          
          doc.autoTable({
            head: [data[0]],
            body: data.slice(1),
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
            }, {} as Record<number, CellStyle>),
            margin: { top: 20, right: 15, bottom: 20, left: 15 },
            didParseCell: function(data: CellHookData) {
              // Türkçe karakterleri düzgün göstermek için encoding
              if (data.text) {
                data.text = data.text.map((text: string) => 
                  decodeURIComponent(encodeURIComponent(text))
                )
              }

              // Başlık hücreleri için bold font
              if (data.row.index === 0) {
                data.cell.styles.fontStyle = 'bold'
              }
            },
            willDrawCell: function(data: CellHookData) {
              // Hücre içeriğini kontrol et
              if (data.cell.text) {
                const text = Array.isArray(data.cell.text) ? data.cell.text.join(' ') : data.cell.text
                // Çok uzun içerik varsa font boyutunu küçült
                if (text.length > 40) {
                  data.cell.styles.fontSize = 7
                }
              }
            },
          })

          const pdfData = doc.output('datauristring')
          
          if (pdfRef.current) {
            pdfRef.current.innerHTML = `
              <iframe 
                src="${pdfData}" 
                width="100%" 
                height="600px" 
                style="border: 1px solid #ccc; border-radius: 4px;"
              ></iframe>
            `
          }
        } catch (error) {
          console.error('PDF önizleme hatası:', error)
          toast.error("PDF önizleme oluşturulurken bir hata oluştu")
        }
      }

      generatePDFPreview()
    }
  }, [data, format])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Önizlenecek veri bulunamadı
      </div>
    )
  }

  const headers = data[0]
  const rows = data.slice(1)

  const handleCopy = async () => {
    try {
      let content = ""
      switch (format) {
        case "xlsx":
          content = rows.map(row => row.join("\t")).join("\n")
          break
        case "csv":
          content = rows.map(row => row.join(",")).join("\n")
          break
        case "json":
          const jsonData = rows.map((row) => {
            const obj: Record<string, string> = {}
            headers.forEach((header, index) => {
              obj[header] = row[index] || ""
            })
            return obj
          })
          content = JSON.stringify(jsonData, null, 2)
          break
        case "markdown":
          content = mdContent
          break
      }

      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      toast.success("İçerik panoya kopyalandı")
      setTimeout(() => setIsCopied(false), 2000)
    } catch  {
      toast.error("Kopyalama işlemi başarısız oldu")
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      previewRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const renderPreview = () => {
    const commonControls = (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="icon"
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          aria-label="Tabloyu kopyala"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={handleZoomIn}
          variant="ghost"
          size="icon"
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          aria-label="Yakınlaştır"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          variant="ghost"
          size="icon"
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          aria-label="Uzaklaştır"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleFullscreen}
          variant="ghost"
          size="icon"
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran yap"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    )

    const previewContainer = (content: React.ReactNode) => (
      <div 
        ref={previewRef}
        className={cn(
          "overflow-x-auto border rounded-md bg-white",
          "transition-all duration-200 ease-in-out",
          isFullscreen ? "fixed inset-0 z-50 m-0" : "relative"
        )}
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {content}
      </div>
    )

    switch (format) {
      case "xlsx":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Excel Önizleme</h3>
              {commonControls}
            </div>
            {previewContainer(
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-background">
                  <thead>
                    <tr>
                      {headers.map((header, index) => (
                        <th 
                          key={index} 
                          className="border border-border bg-muted p-3 text-left text-sm font-medium sticky top-0"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {rows.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex} 
                        className="border-b border-border transition-colors hover:bg-accent/30 even:bg-muted/30"
                      >
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex} 
                            className="border border-border p-3 text-sm"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case "csv":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">CSV Önizleme</h3>
              {commonControls}
            </div>
            {previewContainer(
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md font-mono text-sm">
                {headers.join(",")}
                {"\n"}
                {rows.map((row) => row.join(",")).join("\n")}
              </pre>
            )}
          </div>
        )

      case "pdf":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">PDF Önizleme</h3>
              {commonControls}
            </div>
            {previewContainer(
              <div ref={pdfRef} className="w-full h-full" />
            )}
          </div>
        )

      case "json":
        const jsonData = rows.map((row) => {
          const obj: Record<string, string> = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ""
          })
          return obj
        })

        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">JSON Önizleme</h3>
              {commonControls}
            </div>
            {previewContainer(
              <pre className="font-mono text-sm bg-muted p-4 rounded-md">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            )}
          </div>
        )

      case "markdown":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Markdown Önizleme</h3>
              {commonControls}
            </div>
            {previewContainer(
              <div 
                className="prose dark:prose-invert max-w-none bg-muted p-4 rounded-md"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>
        )

      default:
        return null
    }
  }

  return renderPreview()
}
