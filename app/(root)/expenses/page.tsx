import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { fetchExpenses } from "@/lib/services/expenses.service";
import { fetchCurrentUser } from "@/lib/services/user.service";
import { parseMonthString, formatMonthString } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { isSoftNavigation } from "@/lib/server-utils";
import { ExpensesClient } from "./components/ExpensesClient";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (await isSoftNavigation()) {
    return <ExpensesClient />;
  }

  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const user = await fetchCurrentUser();
  const { year, month } = parseMonthString(user?.settings?.selectedMonth);
  const monthStr = formatMonthString(year, month);

  const filters = { year, month: monthStr, page };

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.expenses.list(filters),
    queryFn: async () => {
      const data = await fetchExpenses(filters);
      if (!data) throw new Error("Expenses not found");
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExpensesClient />
    </HydrationBoundary>
  );
}
