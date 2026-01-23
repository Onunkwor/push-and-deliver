import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  disabled?: boolean;
}

export function ExportButton({
  onClick,
  loading = false,
  label = "Export CSV",
  disabled = false,
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading || disabled}
      className="gap-2"
    >
      <IconDownload className="h-4 w-4" />
      {loading ? "Exporting..." : label}
    </Button>
  );
}
