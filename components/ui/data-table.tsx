"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

export interface DataTablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pagination?: DataTablePagination;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (columnKey: string, sortOrder: "asc" | "desc") => void;
  title?: string;
  emptyState?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  title,
  emptyState,
  keyExtractor,
  className,
}: DataTableProps<T>) {
  const hasData = data && data.length > 0;

  const handleToggleSort = (columnKey: string) => {
    if (!onSortChange) return;
    if (sortBy === columnKey) {
      const nextOrder = sortOrder === "asc" ? "desc" : "asc";
      onSortChange(columnKey, nextOrder);
    } else {
      onSortChange(columnKey, "desc");
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50 shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-foreground shrink-0" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-foreground shrink-0" />
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Pure Table Container */}
      <div className="rounded-lg border border-border bg-card shadow-none overflow-hidden">
        {!hasData ? (
          <div className="p-4">{emptyState}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow className="border-b border-border hover:bg-transparent">
                  {columns.map((col) => {
                    const isSortable = Boolean(col.sortable && onSortChange);
                    return (
                      <TableHead
                        key={col.key}
                        className={cn(
                          "h-9 px-3 text-xs font-semibold tracking-wider text-muted-foreground",
                          isSortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                          col.className,
                          col.headerClassName,
                        )}
                        onClick={isSortable ? () => handleToggleSort(col.key) : undefined}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            col.headerClassName?.includes("text-right") && "justify-end",
                          )}
                        >
                          <span>{col.header}</span>
                          {isSortable && renderSortIcon(col.key)}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, rowIndex) => {
                  const rowKey = keyExtractor
                    ? keyExtractor(item, rowIndex)
                    : (item as { id?: string | number }).id ?? rowIndex;

                  return (
                    <TableRow
                      key={rowKey}
                      className="border-b border-border/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors last:border-b-0"
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={cn("px-4 py-3 text-xs text-foreground", col.className)}
                        >
                          {col.cell(item, rowIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* External Footer: Count & Pagination Controls completely outside table */}
      {hasData && pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
          <div className="font-medium">
            Showing <span className="font-semibold text-foreground">{data.length}</span> of{" "}
            <span className="font-semibold text-foreground">{pagination.total}</span> records
          </div>

          {pagination.totalPages > 1 && onPageChange && (
            <div className="flex items-center gap-3">
              <span className="font-medium">
                Page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-8 gap-1 px-2.5 text-xs font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="h-8 gap-1 px-2.5 text-xs font-medium"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
