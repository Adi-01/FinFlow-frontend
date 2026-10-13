import { TransactionsClient } from "./components/TransactionsClient";
import type { TransactionFilters } from "@/types/api";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    page?: string;
    type?: string;
    category?: string;
    paymentMethod?: string;
    minAmount?: string;
    maxAmount?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: "date" | "amount";
    sortOrder?: "asc" | "desc";
  }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const type =
    resolvedParams.type === "INCOME" || resolvedParams.type === "EXPENSE"
      ? resolvedParams.type
      : "ALL";

  const minAmount = resolvedParams.minAmount
    ? parseFloat(resolvedParams.minAmount)
    : undefined;
  const maxAmount = resolvedParams.maxAmount
    ? parseFloat(resolvedParams.maxAmount)
    : undefined;

  const filters: TransactionFilters = {
    page,
    type,
    category: resolvedParams.category || undefined,
    paymentMethod: resolvedParams.paymentMethod || undefined,
    minAmount: minAmount && !isNaN(minAmount) && minAmount > 0 ? minAmount : undefined,
    maxAmount: maxAmount && !isNaN(maxAmount) && maxAmount > 0 ? maxAmount : undefined,
    startDate: resolvedParams.startDate || undefined,
    endDate: resolvedParams.endDate || undefined,
    search: resolvedParams.search?.trim() || undefined,
    sortBy: resolvedParams.sortBy || "date",
    sortOrder: resolvedParams.sortOrder || "desc",
  };

  return <TransactionsClient initialFilters={filters} />;
}
