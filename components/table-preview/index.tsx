import { useState } from "react"
import { toast } from "sonner"
import { TablePreviewProps, TableData } from "./types"
import { XlsxPreview } from "./previews/xlsx-preview"
import { CsvPreview } from "./previews/csv-preview"
import { PdfPreview } from "./previews/pdf-preview"
import { JsonPreview } from "./previews/json-preview"
import { MarkdownPreview } from "./previews/markdown-preview"

export function TablePreview({ data, format }: TablePreviewProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      toast.success("İçerik panoya kopyalandı")
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error("Kopyalama işlemi başarısız oldu")
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Önizlenecek veri bulunamadı
      </div>
    )
  }

  // string[][] tipindeki veriyi TableData tipine dönüştür
  const tableData: TableData = {
    headers: data[0],
    rows: data.slice(1)
  }

  const previewProps = {
    data: tableData,
    onCopy: handleCopy,
    isCopied
  }

  switch (format) {
    case "xlsx":
      return <XlsxPreview {...previewProps} />
    case "csv":
      return <CsvPreview {...previewProps} />
    case "pdf":
      return <PdfPreview {...previewProps} />
    case "json":
      return <JsonPreview {...previewProps} />
    case "markdown":
      return <MarkdownPreview {...previewProps} />
    default:
      return null
  }
} 