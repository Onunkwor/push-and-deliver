import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { exportRatesService } from "@/services/export-rates.service";
import type { DHLExportRate } from "@/types";
import { toast } from "sonner";
import { LoadingModal } from "@/components/shared/Loader";
import { EditRateModal } from "./EditRateModal";
import { IconPencil } from "@tabler/icons-react";

export default function ExportRatesPage() {
  const [rates, setRates] = useState<DHLExportRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRate, setSelectedRate] = useState<DHLExportRate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      const data = await exportRatesService.getExportRates();
      setRates(data);
    } catch (error) {
      console.error("Error loading rates:", error);
      toast.error("Failed to load export rates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate: DHLExportRate) => {
    setSelectedRate(rate);
    setIsModalOpen(true);
  };

  const handleModalSave = async (updatedRate: DHLExportRate) => {
    try {
      // 1. Update the local state first to reflect changes immediately
      const newRates = rates.map((r) =>
        r.weight === updatedRate.weight ? updatedRate : r
      );
      setRates(newRates);

      // 2. Persist to backend
      // Note: We are updating the entire list because the service expects that.
      await exportRatesService.updateExportRates(newRates);

      toast.success("Rate updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving rate:", error);
      toast.error("Failed to update rate");
      // Revert local state if needed (could reload from server)
      // loadRates();
      throw error;
    }
  };

  if (loading) {
    return <LoadingModal />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Export Rates</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Rates (Naira)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Weight (kg)</TableHead>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((zone) => (
                    <TableHead key={zone} className="whitespace-nowrap">
                      Zone {zone}
                    </TableHead>
                  ))}
                  <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate, index) => (
                  <TableRow
                    key={index}
                    className="group cursor-default hover:bg-muted/40"
                  >
                    <TableCell className="font-medium bg-muted/30">
                      {rate.weight}
                    </TableCell>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((zoneNum) => {
                      const zoneKey = `zone${zoneNum}` as keyof DHLExportRate;
                      return (
                        <TableCell key={zoneKey}>
                          ₦{rate[zoneKey]?.toLocaleString() ?? 0}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => handleEdit(rate)}
                            >
                              <IconPencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Rates</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditRateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rate={selectedRate}
        onSave={handleModalSave}
      />
    </div>
  );
}
