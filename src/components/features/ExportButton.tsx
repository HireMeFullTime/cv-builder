"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export");

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to export data");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = downloadRef.current;

      if (anchor) {
        anchor.href = url;
        anchor.download = `cv_export_${new Date().toISOString().split("T")[0]}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      }

      toast.success("Data exported successfully!");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline-block">
          {isExporting ? "Exporting..." : "Export JSON"}
        </span>
      </Button>
      {/* Hidden anchor managed by React ref — no DOM manipulation */}
      <a ref={downloadRef} className="hidden" aria-hidden="true" />
    </>
  );
}
