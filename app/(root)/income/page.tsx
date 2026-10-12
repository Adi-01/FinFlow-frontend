import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { fetchIncomes } from "@/lib/services/income.service";
import { fetchCurrentUser } from "@/lib/services/user.service";
import { parseMonthString, formatMonthString } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { isSoftNavigation } from "@/lib/server-utils";
import { IncomeClient } from "./components/IncomeClient";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (await isSoftNavigation()) {
    return <IncomeClient />;
  }

  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const user = await fetchCurrentUser();
  const { year, month } = parseMonthString(user?.settings?.selectedMonth);
  const monthStr = formatMonthString(year, month);

  const filters = { year, month: monthStr, page };

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.income.list(filters),
    queryFn: async () => {
      const data = await fetchIncomes(filters);
      if (!data) throw new Error("Incomes not found");
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncomeClient />
    </HydrationBoundary>
  );
}
