import { PreviewComponentProps } from "../types"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateMarkdownContent, convertToHtml } from "../utils"
import { useState, useEffect } from "react"

export function MarkdownPreview({ data, onCopy, isCopied }: PreviewComponentProps) {
  const [htmlContent, setHtmlContent] = useState("")

  useEffect(() => {
    const tableArray = [data.headers, ...data.rows]
    const markdown = generateMarkdownContent(tableArray)
    const html = convertToHtml(markdown)
    setHtmlContent(html)
  }, [data])

  const handleCopy = async () => {
    const tableArray = [data.headers, ...data.rows]
    const content = generateMarkdownContent(tableArray)
    await onCopy(content)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Markdown Önizleme</h3>
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
        <div 
          className="prose max-w-none bg-muted/50 p-4 rounded-md"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </ScrollArea>
    </div>
  )
} 