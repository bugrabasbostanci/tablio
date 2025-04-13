export type FormatType = "xlsx" | "csv" | "pdf" | "json" | "markdown"

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface TablePreviewProps {
  data: string[][]
  format: FormatType
}

export interface PreviewComponentProps {
  data: string[][]
  onCopy: (content: string) => Promise<void>
  isCopied: boolean
} 