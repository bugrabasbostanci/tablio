import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Copy, Download } from "lucide-react"
import { TableData } from "../types"

export function PdfPreview({ data }: { data: TableData }) {
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (data.rows.length === 0) return

    try {
      // PDF oluştur
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      })

      // Times New Roman fontunu kullan
      doc.setFont("times", "normal")
      doc.setFontSize(16)
      doc.text("Tablo Önizleme", 40, 40)

      // Tablo oluştur
      autoTable(doc, {
        head: [data.headers],
        body: data.rows,
        startY: 60,
        styles: {
          font: "times",
          fontSize: 10,
          cellPadding: 6,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'middle'
        },
        headStyles: {
          font: "times",
          fontStyle: "bold",
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
          halign: 'center',
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 60, right: 30, bottom: 30, left: 30 },
        columnStyles: {
          ...Object.fromEntries(
            data.headers.map((_, index) => [index, { cellWidth: 'auto' }])
          )
        },
        showFoot: 'everyPage',
        showHead: 'everyPage',
        didDrawPage: (data) => {
          const pageCount = doc.internal.pages.length
          doc.setFontSize(8)
          doc.setFont("times", "normal")
          doc.text(
            `Sayfa ${data.pageNumber} / ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.getHeight() - 10
          )
          
          const date = new Date().toLocaleDateString('tr-TR')
          doc.text(
            `Oluşturulma Tarihi: ${date}`,
            doc.internal.pageSize.getWidth() - data.settings.margin.right,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' }
          )
        }
      })

      const pdfBlob = doc.output("blob")
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("PDF oluşturma hatası:", error)
      toast.error("PDF oluşturulurken bir hata oluştu")
    }
  }, [data])

  const handleCopy = async () => {
    try {
      if (!pdfUrl) return
      const response = await fetch(pdfUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      setIsCopied(true)
      toast.success("PDF panoya kopyalandı")
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error("Kopyalama başarısız oldu")
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = "tablo-onizleme.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (data.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <FileText className="w-8 h-8 mr-2" />
        <span>PDF önizlemesi için veri gerekli</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">PDF Önizleme</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!pdfUrl || isCopied}
          >
            <Copy className="w-4 h-4 mr-2" />
            {isCopied ? "Kopyalandı" : "Kopyala"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            <Download className="w-4 h-4 mr-2" />
            İndir
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[500px] border rounded-md">
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="PDF Önizleme"
          />
        )}
      </ScrollArea>
    </div>
  )
} 