"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTransactions } from "@/lib/hooks/queries/useTransactions";
import { useUserContext } from "@/components/providers/user-provider";
import { TransactionFiltersBar } from "./TransactionFiltersBar";
import { TransactionsTable } from "./TransactionsTable";
import { AddTransactionModal } from "./AddTransactionModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { TransactionFilters } from "@/types/api";

interface TransactionsClientProps {
  initialFilters: TransactionFilters;
}

import { useMonthContext } from "@/components/providers/month-provider";

export function TransactionsClient({
  initialFilters,
}: TransactionsClientProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { monthStr } = useMonthContext();

  const activeFilters = useMemo(
    (): TransactionFilters => ({
      ...initialFilters,
      month: monthStr,
    }),
    [initialFilters, monthStr]
  );

  // Suspense query backed by centralized hierarchical QUERY_KEYS
  const { data: transactionsData } = useTransactions(activeFilters);
  const { currencySymbol } = useUserContext();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/transactions?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    const params = new URLSearchParams(window.location.search);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!("page" in newFilters)) {
      params.set("page", "1");
    }

    router.push(`/transactions?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push(`/transactions`);
  };

  const handleSortChange = (sortBy: "date" | "amount", sortOrder: "asc" | "desc") => {
    handleFilterChange({ sortBy, sortOrder });
  };

  const isFiltered = Boolean(
    initialFilters.search ||
      (initialFilters.type && initialFilters.type !== "ALL") ||
      initialFilters.category ||
      initialFilters.paymentMethod ||
      initialFilters.minAmount ||
      initialFilters.maxAmount ||
      initialFilters.startDate ||
      initialFilters.endDate,
  );

  const hasTransactions = Boolean(
    transactionsData?.items && transactionsData.items.length > 0,
  );
  const showHeaderAddButton = hasTransactions || isFiltered;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage, filter, and track all your income and expense transactions.
          </p>
        </div>

        {showHeaderAddButton && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        )}
      </div>

      {/* Notion-like Modular Filters Bar */}
      <TransactionFiltersBar
        filters={initialFilters}
        currencySymbol={currencySymbol}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Transactions Data Table */}
      <TransactionsTable
        data={transactionsData}
        currencySymbol={currencySymbol}
        currentFilters={initialFilters}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        onAddTransaction={() => setIsAddModalOpen(true)}
      />

      {isAddModalOpen && (
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
