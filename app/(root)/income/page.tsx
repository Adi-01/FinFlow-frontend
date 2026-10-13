import { Suspense } from "react";
import { IncomeClient } from "./components/IncomeClient";
import { IncomeSkeleton } from "./components/IncomeSkeleton";

export default function IncomePage() {
  return (
    <Suspense fallback={<IncomeSkeleton />}>
      <IncomeClient />
    </Suspense>
  );
}
