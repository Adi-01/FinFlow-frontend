"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIncomes } from "@/lib/hooks/queries/useIncomeQueries";
import { IncomeTable } from "./IncomeTable";
import { AddIncomeModal } from "./AddIncomeModal";
import { useUserContext } from "@/components/providers/user-provider";
import type { IncomeFilters } from "@/types/api";

import { useMonthContext } from "@/components/providers/month-provider";

export function IncomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currencySymbol } = useUserContext();
  const { year, monthStr } = useMonthContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Parse pagination from URL
  const page = parseInt(searchParams.get("page") || "1", 10);

  const filters: IncomeFilters = {
    page,
    year,
    month: monthStr,
  };

  const { data } = useIncomes(filters);
  const hasIncomes = Boolean(data?.items && data.items.length > 0);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/income?${params.toString()}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Income
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your revenue streams.
          </p>
        </div>

        {hasIncomes && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </div>
        )}
      </div>

      <IncomeTable
        data={data}
        currencySymbol={currencySymbol}
        onPageChange={handlePageChange}
        onAddIncome={() => setIsAddModalOpen(true)}
      />

      {isAddModalOpen && (
        <AddIncomeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
