"use client";

import { useState } from "react";
import { useDashboardMetrics } from "@/lib/hooks/queries/useDashboardQueries";
import { useUpdateAllowance } from "@/lib/hooks/mutations/useDashboardMutations";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DashboardCharts } from "./DashboardCharts";
import { AllowanceModal } from "./AllowanceModal";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { AddTransactionModal } from "@/app/(root)/transactions/components/AddTransactionModal";
import { useUserContext } from "@/components/providers/user-provider";
import { useMonthContext } from "@/components/providers/month-provider";

export function DashboardClient() {
  const { year, month } = useMonthContext();

  const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [allowanceInput, setAllowanceInput] = useState("");

  const { data: dashboardData, isLoading } = useDashboardMetrics(year, month);

  const { currencySymbol } = useUserContext();

  const allowanceMutation = useUpdateAllowance(year, month, () => {
    setIsAllowanceModalOpen(false);
  });

  const handleAllowanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(allowanceInput);
    if (!isNaN(val) && val > 0) {
      allowanceMutation.mutate(val);
    }
  };

  const openAllowanceModal = (initialValue: number) => {
    setAllowanceInput(initialValue.toString());
    setIsAllowanceModalOpen(true);
  };

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  const {
    summary,
    dailyAnalytics,
    expenseCategoryBreakdown,
    incomeSourceBreakdown,
  } = dashboardData;

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader onAddTransaction={() => setIsAddTransactionModalOpen(true)} />

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
