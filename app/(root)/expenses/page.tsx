import { Suspense } from "react";
import { ExpensesClient } from "./components/ExpensesClient";
import { ExpensesSkeleton } from "./components/ExpensesSkeleton";

export default function ExpensesPage() {
  return (
    <Suspense fallback={<ExpensesSkeleton />}>
      <ExpensesClient />
    </Suspense>
  );
}
