"use client";

import React from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingDown, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaginatedResponse, Expense } from "@/types/api";

interface ExpensesTableProps {
  data: PaginatedResponse<Expense>;
  currencySymbol: string;
  onPageChange: (page: number) => void;
  onAddExpense?: () => void;
}

export function ExpensesTable({
  data,
  currencySymbol,
  onPageChange,
  onAddExpense,
}: ExpensesTableProps) {
  const { items, pagination } = data;

  const columns: DataTableColumn<Expense>[] = [
    {
      key: "date",
      header: "Date",
      className: "w-[130px] whitespace-nowrap font-medium text-xs",
      cell: (exp) => formatDate(exp.date),
    },
    {
      key: "category",
      header: "Category",
      className: "font-medium text-xs max-w-[160px] truncate",
      cell: (exp) => (
        <span className="flex items-center gap-1.5 font-medium text-xs">
          <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          {exp.category.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      className: "hidden sm:table-cell w-[140px]",
      cell: (exp) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
          {exp.paymentMethod.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "hidden md:table-cell max-w-[220px] truncate text-xs text-muted-foreground",
      cell: (exp) => exp.description || "-",
    },
    {
      key: "amount",
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right font-semibold text-xs whitespace-nowrap text-foreground w-[130px]",
      cell: (exp) => `-${formatCurrency(exp.amount, currencySymbol)}`,
    },
  ];

  const emptyState = (
    <EmptyState
      icon={TrendingDown}
      title="No expenses recorded yet"
      description="You haven't recorded any expenses for this month."
      action={
        onAddExpense
          ? {
              label: "Add Expense",
              onClick: onAddExpense,
              icon: Plus,
              variant: "default",
            }
          : undefined
      }
    />
  );

  return (
    <DataTable<Expense>
      columns={columns}
      data={items}
      pagination={pagination}
      onPageChange={onPageChange}
      emptyState={emptyState}
    />
  );
}
