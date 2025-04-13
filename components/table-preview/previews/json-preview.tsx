import { PreviewComponentProps } from "../types"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateJsonContent } from "../utils"

export function JsonPreview({ data, onCopy, isCopied }: PreviewComponentProps) {
  const handleCopy = async () => {
    const content = generateJsonContent(data)
    await onCopy(content)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">JSON Önizleme</h3>
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
        <pre className="font-mono text-sm bg-muted/50 p-4 rounded-md">
          {generateJsonContent(data)}
        </pre>
      </ScrollArea>
    </div>
  )
} 