"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { useDashboardMetrics } from "@/lib/hooks/queries/useDashboardQueries";
import { useUpdateAllowance } from "@/lib/hooks/mutations/useDashboardMutations";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DashboardCharts } from "./DashboardCharts";
import { AllowanceModal } from "./AllowanceModal";
import { AddTransactionModal } from "@/app/(root)/transactions/components/AddTransactionModal";
import { useUserContext } from "@/components/providers/user-provider";
import { useMonthContext } from "@/components/providers/month-provider";

export function DashboardClient() {
  const { year, month } = useMonthContext();

  const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [allowanceInput, setAllowanceInput] = useState("");

  const { data: dashboardData } = useDashboardMetrics(year, month);

  const { currencySymbol } = useUserContext();

  const allowanceMutation = useUpdateAllowance(year, month, () => {
    setIsAllowanceModalOpen(false);
  });

  const handleAllowanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(allowanceInput);
    if (!isNaN(val) && val >= 0) {
      allowanceMutation.mutate(val);
    }
  };

  const openAllowanceModal = (initialValue: number) => {
    setAllowanceInput(initialValue.toString());
    setIsAllowanceModalOpen(true);
  };

  const {
    summary,
    dailyAnalytics,
    expenseCategoryBreakdown,
    incomeSourceBreakdown,
    needsAllowancePrompt,
  } = dashboardData;

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader onAddTransaction={() => setIsAddTransactionModalOpen(true)} />

      {/* Unset Month Allowance Banner */}
      {needsAllowancePrompt && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="text-xs">
              <span className="block text-sm font-bold">Allowance Not Defined</span>
              No starting allowance set for this month. Set an allowance to track your remaining balance accurately.
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => openAllowanceModal(summary.startingAllowance)}
            className="shrink-0 bg-amber-500 font-bold text-white hover:bg-amber-600 dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400 cursor-pointer"
          >
            Set Allowance
          </Button>
        </div>
      )}

      <DashboardStats
        summary={summary}
        currencySymbol={currencySymbol}
        onEditAllowance={() => openAllowanceModal(summary.startingAllowance)}
      />

      <DashboardCharts
        year={year}
        month={month}
        dailyAnalytics={dailyAnalytics}
        expenseCategoryBreakdown={expenseCategoryBreakdown}
        incomeSourceBreakdown={incomeSourceBreakdown}
        currencySymbol={currencySymbol}
      />

      <AllowanceModal
        isOpen={isAllowanceModalOpen}
        onClose={() => setIsAllowanceModalOpen(false)}
        year={year}
        month={month}
        currencySymbol={currencySymbol}
        allowanceInput={allowanceInput}
        setAllowanceInput={setAllowanceInput}
        handleAllowanceSubmit={handleAllowanceSubmit}
        isPending={allowanceMutation.isPending}
      />

      {isAddTransactionModalOpen && (
        <AddTransactionModal
          isOpen={isAddTransactionModalOpen}
          onClose={() => setIsAddTransactionModalOpen(false)}
        />
      )}
    </div>
  );
}
