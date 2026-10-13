"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/lib/hooks/queries/useExpenseQueries";
import { ExpensesTable } from "./ExpensesTable";
import { AddExpenseModal } from "./AddExpenseModal";
import { ExpensesSkeleton } from "./ExpensesSkeleton";
import { useUserContext } from "@/components/providers/user-provider";

import { formatMonthString } from "@/lib/utils";
import type { ExpenseFilters } from "@/types/api";

import { useMonthContext } from "@/components/providers/month-provider";

export function ExpensesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currencySymbol } = useUserContext();
  const { year, monthStr } = useMonthContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Parse pagination from URL
  const page = parseInt(searchParams.get("page") || "1", 10);

  const filters: ExpenseFilters = {
    page,
    year,
    month: monthStr,
  };

  const { data, isLoading } = useExpenses(filters);

  if (isLoading || !data) {
    return <ExpensesSkeleton />;
  }

  const hasExpenses = Boolean(data?.items && data.items.length > 0);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/expenses?${params.toString()}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your spending.
          </p>
        </div>

        {hasExpenses && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        )}
      </div>

      <ExpensesTable
        data={data}
        currencySymbol={currencySymbol}
        onPageChange={handlePageChange}
        onAddExpense={() => setIsAddModalOpen(true)}
      />

      {isAddModalOpen && (
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
