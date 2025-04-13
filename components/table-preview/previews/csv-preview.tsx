import { PreviewComponentProps } from "../types"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateCsvContent } from "../utils"

export function CsvPreview({ data, onCopy, isCopied }: PreviewComponentProps) {
  const handleCopy = async () => {
    const csvData = [data.headers, ...data.rows]
    const content = generateCsvContent(csvData)
    await onCopy(content)
  }

  return (
    <div className="p-4 font-mono text-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">CSV Önizleme</h3>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Kopyalandı</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Kopyala</span>
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="h-[300px]">
        <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
          {generateCsvContent([data.headers, ...data.rows])}
        </pre>
      </ScrollArea>
    </div>
  )
} 