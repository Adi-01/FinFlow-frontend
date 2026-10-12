"use client";

import { useUserContext } from "@/components/providers/user-provider";
import { useAllowanceSummary } from "@/lib/hooks/queries/useAllowanceQueries";

interface UseBudgetPreviewParams {
  date?: string;
  amount?: number;
  type: "INCOME" | "EXPENSE";
}

export function useBudgetPreview({
  date,
  amount = 0,
  type,
}: UseBudgetPreviewParams) {
  const { currencySymbol } = useUserContext();

  // Parse year and month from ISO date string (YYYY-MM-DD)
  const dateObj = date ? new Date(date) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

  const year = validDate.getFullYear();
  const month = validDate.getMonth() + 1;

  const { data: summary, isLoading } = useAllowanceSummary(year, month);

  const startingAllowance = summary?.startingAllowance ?? 0;
  const currentRemaining = summary?.remainingBalance ?? 0;

  const parsedAmount = Math.max(0, isNaN(amount) ? 0 : amount);

  const newRemaining =
    type === "INCOME"
      ? currentRemaining + parsedAmount
      : currentRemaining - parsedAmount;

  const isOverBudget = type === "EXPENSE" && parsedAmount > 0 && newRemaining < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(newRemaining) : 0;

  let impactPercentage = 0;
  if (parsedAmount > 0) {
    if (currentRemaining > 0) {
      impactPercentage = Math.min(100, Math.round((parsedAmount / currentRemaining) * 100));
    } else {
      impactPercentage = 100;
    }
  }

  const needsAllowancePrompt = summary?.needsAllowancePrompt ?? false;

  return {
    year,
    month,
    isLoading,
    currencySymbol,
    startingAllowance,
    currentRemaining,
    newRemaining,
    isOverBudget,
    overBudgetAmount,
    impactPercentage,
    needsAllowancePrompt,
  };
}
