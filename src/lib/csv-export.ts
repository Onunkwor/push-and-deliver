// CSV Export Utility - No external dependencies needed

export interface CSVColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | undefined | null);
}

export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Build header row
  const headers = columns.map((col) => escapeCSVValue(col.header)).join(",");

  // Build data rows
  const rows = data
    .map((item) =>
      columns
        .map((col) => {
          const value =
            typeof col.accessor === "function"
              ? col.accessor(item)
              : item[col.accessor];
          return escapeCSVValue(String(value ?? ""));
        })
        .join(",")
    )
    .join("\n");

  // Create CSV content
  const csvContent = `${headers}\n${rows}`;

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function escapeCSVValue(value: string): string {
  // If value contains comma, double quote, or newline, wrap in quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // Escape double quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
