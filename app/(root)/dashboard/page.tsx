import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/services/dashboard.service";
import { fetchCurrentUser } from "@/lib/services/user.service";
import { parseMonthString } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { isSoftNavigation } from "@/lib/server-utils";
import { DashboardClient } from "./components/DashboardClient";

export default async function DashboardPage() {
  if (await isSoftNavigation()) {
    return <DashboardClient />;
  }

  const user = await fetchCurrentUser();
  const { year, month } = parseMonthString(user?.settings?.selectedMonth);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.dashboard.byMonth(year, month),
    queryFn: async () => {
      const data = await fetchDashboard(year, month);
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
