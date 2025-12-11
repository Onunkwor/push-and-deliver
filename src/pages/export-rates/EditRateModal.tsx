import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DHLExportRate } from "@/types/export-rates";
import { useEffect, useState } from "react";

interface EditRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate: DHLExportRate | null;
  onSave: (updatedRate: DHLExportRate) => Promise<void>;
}

export function EditRateModal({
  isOpen,
  onClose,
  rate,
  onSave,
}: EditRateModalProps) {
  const [formData, setFormData] = useState<DHLExportRate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rate) {
      setFormData({ ...rate });
    }
  }, [rate]);

  const handleChange = (field: keyof DHLExportRate, value: string) => {
    if (!formData) return;
    const numValue = parseFloat(value);

    setFormData({
      ...formData,
      [field]: isNaN(numValue) ? 0 : numValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save rate", error);
    } finally {
      setSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Rates for {formData.weight}kg</DialogTitle>
          <DialogDescription>
            Update the shipping rates for different zones. All prices are in
            Naira (₦).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((zone) => {
              const zoneKey = `zone${zone}` as keyof DHLExportRate;
              return (
                <div key={zone} className="space-y-2">
                  <Label htmlFor={zoneKey}>Zone {zone}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      ₦
                    </span>
                    <Input
                      id={zoneKey}
                      type="number"
                      className="pl-7"
                      value={formData[zoneKey]}
                      onChange={(e) => handleChange(zoneKey, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
