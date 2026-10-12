import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMonthYear } from "@/lib/utils";

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  currencySymbol: string;
  allowanceInput: string;
  setAllowanceInput: (val: string) => void;
  handleAllowanceSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function AllowanceModal({
  isOpen,
  onClose,
  year,
  month,
  currencySymbol,
  allowanceInput,
  setAllowanceInput,
  handleAllowanceSubmit,
  isPending,
}: AllowanceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Starting Allowance</DialogTitle>
          <DialogDescription>
            Input the allocated starting allowance for{" "}
            {formatMonthYear(year, month)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAllowanceSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="allowanceInput">
              Allowance Amount ({currencySymbol})
            </Label>
            <Input
              id="allowanceInput"
              type="number"
              step="0.01"
              min="0"
              placeholder="3000.00"
              value={allowanceInput}
              onChange={(e) => setAllowanceInput(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save Allowance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
