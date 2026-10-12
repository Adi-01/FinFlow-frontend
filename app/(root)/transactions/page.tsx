import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { fetchTransactions } from "@/lib/services/transactions.service";
import { fetchCurrentUser } from "@/lib/services/user.service";
import { parseMonthString, formatMonthString } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { isSoftNavigation } from "@/lib/server-utils";
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

  if (await isSoftNavigation()) {
    return <TransactionsClient initialFilters={filters} />;
  }

  const user = await fetchCurrentUser();
  const { year, month } = parseMonthString(user?.settings?.selectedMonth);
  const monthStr = formatMonthString(year, month);
  const fullFilters: TransactionFilters = { ...filters, month: monthStr };

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.transactions.list(fullFilters),
    queryFn: async () => {
      const data = await fetchTransactions(fullFilters);
      if (!data) throw new Error("Transactions not found");
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsClient initialFilters={fullFilters} />
    </HydrationBoundary>
  );
}
