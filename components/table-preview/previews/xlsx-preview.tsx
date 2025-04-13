import { PreviewComponentProps } from "../types"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { generateXlsxContent } from "../utils"

export function XlsxPreview({ data, onCopy, isCopied }: PreviewComponentProps) {
  const { headers, rows } = data

  const handleCopy = async () => {
    const tableArray = [headers, ...rows]
    const content = generateXlsxContent(tableArray)
    await onCopy(content)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Excel Önizleme</h3>
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header: string, index: number) => (
                <th key={index} className="border p-2 text-left text-sm font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-muted/50">
                {row.map((cell: string, cellIndex: number) => (
                  <td key={cellIndex} className="border p-2 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 