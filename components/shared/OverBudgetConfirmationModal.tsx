"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OverBudgetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expenseAmount: number;
  currentRemaining: number;
  overBudgetAmount: number;
  currencySymbol: string;
  isPending?: boolean;
}

export function OverBudgetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  expenseAmount,
  currentRemaining,
  overBudgetAmount,
  currencySymbol,
  isPending,
}: OverBudgetConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base">
                Over-Budget Expense Warning
              </DialogTitle>
              <DialogDescription className="text-xs">
                This transaction exceeds your allocated balance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5 text-foreground">
            <div className="flex justify-between items-center min-w-0 gap-2">
              <span className="text-muted-foreground shrink-0">Expense Amount:</span>
              <span className="font-semibold truncate max-w-[180px]" title={formatCurrency(expenseAmount, currencySymbol)}>
                {formatCurrency(expenseAmount, currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center min-w-0 gap-2">
              <span className="text-muted-foreground shrink-0">Remaining Balance:</span>
              <span className="font-semibold truncate max-w-[180px]" title={formatCurrency(currentRemaining, currencySymbol)}>
                {formatCurrency(currentRemaining, currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-rose-500/20 pt-1.5 font-bold text-rose-600 dark:text-rose-400 min-w-0 gap-2">
              <span className="shrink-0">Budget Overdraft:</span>
              <span className="truncate max-w-[180px]" title={`+${formatCurrency(overBudgetAmount, currencySymbol)}`}>
                +{formatCurrency(overBudgetAmount, currencySymbol)}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground">
            Are you sure you want to proceed with logging this transaction?
          </p>
        </div>

        <DialogFooter className="gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proceed Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
