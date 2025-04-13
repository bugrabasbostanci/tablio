import { marked } from "marked"

export const generateMarkdownContent = (data: string[][]) => {
  let content = ""
  
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

  return content
}

export const generateMarkdownStyles = () => `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 0.9em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    th {
      background-color: #f8f9fa;
      color: #333;
      font-weight: 600;
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #dee2e6;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    tr:hover {
      background-color: #f2f2f2;
    }
  </style>
`

export const convertToHtml = (markdown: string) => {
  const styles = generateMarkdownStyles()
  return styles + marked(markdown)
}

export const generateJsonContent = (data: string[][]) => {
  const headers = data[0]
  const rows = data.slice(1)
  
  const jsonData = rows.map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ""
    })
    return obj
  })

  return JSON.stringify(jsonData, null, 2)
}

export const generateCsvContent = (data: string[][]) => {
  const headers = data[0]
  const rows = data.slice(1)
  return headers.join(",") + "\n" + rows.map(row => row.join(",")).join("\n")
}

export const generateXlsxContent = (data: string[][]) => {
  const rows = data.slice(1)
  return rows.map(row => row.join("\t")).join("\n")
} 