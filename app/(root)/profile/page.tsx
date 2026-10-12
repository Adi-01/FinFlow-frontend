import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { fetchProfileServer } from "@/lib/services/profile.service";
import { getCategoriesAction } from "@/app/actions/category";
import { getPaymentMethodsAction } from "@/app/actions/paymentMethod";
import { QUERY_KEYS } from "@/lib/constants";
import { isSoftNavigation } from "@/lib/server-utils";
import { ProfileClient } from "./components/ProfileClient";

export default async function ProfilePage() {
  const queryClient = new QueryClient();

  // Skip server prefetching on soft client-side navigations to save backend resources.
  if (!(await isSoftNavigation())) {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.profile.me,
        queryFn: async () => {
          const data = await fetchProfileServer();
          if (!data) throw new Error("Profile not found");
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.categories.all,
        queryFn: async () => {
          const res = await getCategoriesAction();
          if (!res || !res.data) throw new Error("Categories not found");
          return res.data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.paymentMethods.all,
        queryFn: async () => {
          const res = await getPaymentMethodsAction();
          if (!res || !res.data) throw new Error("Payment methods not found");
          return res.data;
        },
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileClient />
    </HydrationBoundary>
  );
}
