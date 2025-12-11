import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportRatesService } from "@/services/export-rates.service";
import type { DHLExportRate } from "@/types";
import { toast } from "sonner";
import { LoadingModal } from "@/components/shared/Loader";

export default function ExportRatesPage() {
  const [rates, setRates] = useState<DHLExportRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      const data = await exportRatesService.getExportRates();
      setRates(data);
      setHasChanges(false);
    } catch (error) {
      console.error("Error loading rates:", error);
      toast.error("Failed to load export rates");
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (
    index: number,
    field: keyof DHLExportRate,
    value: string
  ) => {
    const newRates = [...rates];
    // Allow empty string for better typing experience, but convert to 0 or keep as is if needed
    // However, the type is number. So we might need to handle it carefully.
    // For now, let's parse float.
    const numValue = parseFloat(value);

    if (!isNaN(numValue) || value === "") {
      newRates[index] = {
        ...newRates[index],
        [field]: value === "" ? 0 : numValue,
      };
      setRates(newRates);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await exportRatesService.updateExportRates(rates);
      toast.success("Export rates updated successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating rates:", error);
      toast.error("Failed to update export rates");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingModal />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Export Rates</h1>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
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
                  <TableHead>Zone 1</TableHead>
                  <TableHead>Zone 2</TableHead>
                  <TableHead>Zone 3</TableHead>
                  <TableHead>Zone 4</TableHead>
                  <TableHead>Zone 5</TableHead>
                  <TableHead>Zone 6</TableHead>
                  <TableHead>Zone 7</TableHead>
                  <TableHead>Zone 8</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rate.weight}</TableCell>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((zoneNum) => {
                      const zoneKey = `zone${zoneNum}` as keyof DHLExportRate;
                      return (
                        <TableCell key={zoneKey}>
                          <Input
                            type="number"
                            value={rate[zoneKey]}
                            onChange={(e) =>
                              handleRateChange(index, zoneKey, e.target.value)
                            }
                            className="w-full min-w-[100px]"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            ₦{rate[zoneKey]?.toLocaleString()}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
