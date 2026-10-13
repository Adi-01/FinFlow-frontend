import { Suspense } from "react";
import { TransactionsClient } from "./components/TransactionsClient";
import { TransactionsSkeleton } from "./components/TransactionsSkeleton";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsClient />
    </Suspense>
  );
}
