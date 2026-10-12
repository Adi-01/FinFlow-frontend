"use client";

import React from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Plus,
  Receipt,
  SearchX,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  PaginatedResponse,
  UnifiedTransaction,
  TransactionFilters,
} from "@/types/api";

interface TransactionsTableProps {
  data: PaginatedResponse<UnifiedTransaction>;
  currencySymbol: string;
  currentFilters: TransactionFilters;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: "date" | "amount", sortOrder: "asc" | "desc") => void;
  onResetFilters?: () => void;
  onAddTransaction?: () => void;
}

export function TransactionsTable({
  data,
  currencySymbol,
  currentFilters,
  onPageChange,
  onSortChange,
  onResetFilters,
  onAddTransaction,
}: TransactionsTableProps) {
  const { items, pagination } = data;

  const isFiltered = Boolean(
    currentFilters.search ||
      (currentFilters.type && currentFilters.type !== "ALL") ||
      currentFilters.category ||
      currentFilters.paymentMethod ||
      currentFilters.minAmount ||
      currentFilters.maxAmount ||
      currentFilters.startDate ||
      currentFilters.endDate,
  );

  const columns: DataTableColumn<UnifiedTransaction>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      className: "w-[120px] whitespace-nowrap font-medium text-xs",
      cell: (tx) => formatDate(tx.date),
    },
    {
      key: "type",
      header: "Type",
      className: "hidden sm:table-cell w-[100px]",
      cell: (tx) =>
        tx.type === "INCOME" ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Income
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-3.5 w-3.5" />
            Expense
          </span>
        ),
    },
    {
      key: "categoryOrSource",
      header: "Category / Source",
      className: "font-medium text-xs max-w-[160px] truncate",
      cell: (tx) => tx.categoryOrSource,
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      className: "hidden md:table-cell w-[140px]",
      cell: (tx) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
          {tx.paymentMethod.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "hidden lg:table-cell max-w-[220px] truncate text-xs text-muted-foreground",
      cell: (tx) => tx.descriptionOrNotes || "-",
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      headerClassName: "text-right",
      className: "text-right font-semibold text-xs whitespace-nowrap w-[130px]",
      cell: (tx) => (
        <span
          className={
            tx.type === "INCOME"
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-foreground font-semibold"
          }
        >
          {tx.type === "INCOME" ? "+" : "-"}
          {formatCurrency(tx.amount, currencySymbol)}
        </span>
      ),
    },
  ];

  const emptyState = isFiltered ? (
    <EmptyState
      icon={SearchX}
      title="No matching transactions"
      description="No transactions match your active filters. Try adjusting your search term, date range, or price filters."
      action={
        onResetFilters
          ? {
              label: "Reset Filters",
              onClick: onResetFilters,
              icon: RotateCcw,
              variant: "outline",
            }
          : undefined
      }
    />
  ) : (
    <EmptyState
      icon={Receipt}
      title="No transactions yet"
      description="You haven't recorded any income or expenses for this month."
      action={
        onAddTransaction
          ? {
              label: "Add Transaction",
              onClick: onAddTransaction,
              icon: Plus,
              variant: "default",
            }
          : undefined
      }
    />
  );

  return (
    <DataTable<UnifiedTransaction>
      columns={columns}
      data={items}
      pagination={pagination}
      onPageChange={onPageChange}
      sortBy={currentFilters.sortBy}
      sortOrder={currentFilters.sortOrder}
      onSortChange={(col, order) => {
        if (onSortChange && (col === "date" || col === "amount")) {
          onSortChange(col, order);
        }
      }}
      emptyState={emptyState}
    />
  );
}
