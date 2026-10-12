"use client";

import React from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaginatedResponse, Income } from "@/types/api";

interface IncomeTableProps {
  data: PaginatedResponse<Income>;
  currencySymbol: string;
  onPageChange: (page: number) => void;
  onAddIncome?: () => void;
}

export function IncomeTable({
  data,
  currencySymbol,
  onPageChange,
  onAddIncome,
}: IncomeTableProps) {
  const { items, pagination } = data;

  const columns: DataTableColumn<Income>[] = [
    {
      key: "date",
      header: "Date",
      className: "w-[130px] whitespace-nowrap font-medium text-xs",
      cell: (inc) => formatDate(inc.date),
    },
    {
      key: "source",
      header: "Source",
      className: "font-medium text-xs max-w-[160px] truncate",
      cell: (inc) => (
        <span className="flex items-center gap-1.5 font-medium text-xs">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {inc.source.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      className: "hidden sm:table-cell w-[140px]",
      cell: (inc) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
          {inc.paymentMethod.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      className: "hidden md:table-cell max-w-[220px] truncate text-xs text-muted-foreground",
      cell: (inc) => inc.notes || "-",
    },
    {
      key: "amount",
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right font-semibold text-xs whitespace-nowrap text-emerald-600 dark:text-emerald-400 w-[130px]",
      cell: (inc) => `+${formatCurrency(inc.amount, currencySymbol)}`,
    },
  ];

  const emptyState = (
    <EmptyState
      icon={TrendingUp}
      title="No income recorded yet"
      description="You haven't recorded any income for this month."
      action={
        onAddIncome
          ? {
              label: "Add Income",
              onClick: onAddIncome,
              icon: Plus,
              variant: "default",
            }
          : undefined
      }
    />
  );

  return (
    <DataTable<Income>
      columns={columns}
      data={items}
      pagination={pagination}
      onPageChange={onPageChange}
      emptyState={emptyState}
    />
  );
}
