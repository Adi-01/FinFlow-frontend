import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PiggyBankIcon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  ReceiptTextIcon,
  Edit02Icon,
  MoneyAdd01Icon,
} from "@hugeicons/core-free-icons";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSummary } from "@/types/api";

interface DashboardStatsProps {
  summary: DashboardSummary;
  currencySymbol: string;
  onEditAllowance: () => void;
}

export function DashboardStats({
  summary,
  currencySymbol,
  onEditAllowance,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Card 1: Starting Allowance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Starting Allowance
          </CardTitle>
          <button
            onClick={onEditAllowance}
            className="p-1 text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            title="Edit Allowance"
          >
            <HugeiconsIcon icon={Edit02Icon} className="h-3.5 w-3.5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-foreground">
            {formatCurrency(summary.startingAllowance, currencySymbol)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Allocated month balance
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Extra Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Extra Income
          </CardTitle>
          <HugeiconsIcon
            icon={MoneyAdd01Icon}
            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
          />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-foreground">
            {summary.extraIncome > 0 ? "+" : ""}
            {formatCurrency(summary.extraIncome, currencySymbol)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Balance beyond allowance
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Income
          </CardTitle>
          <HugeiconsIcon
            icon={ArrowDownLeft01Icon}
            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
          />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-foreground">
            +{formatCurrency(summary.totalIncome, currencySymbol)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Total added earnings
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            className="h-3.5 w-3.5 text-destructive"
          />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-foreground">
            -{formatCurrency(summary.totalExpense, currencySymbol)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Total recorded spending
          </p>
        </CardContent>
      </Card>

      {/* Card 5: Remaining Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Remaining Balance
          </CardTitle>
          <HugeiconsIcon
            icon={PiggyBankIcon}
            className="h-3.5 w-3.5 text-primary"
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-lg sm:text-xl font-bold tracking-[-0.02em] ${
              summary.remainingBalance >= 0 ? "text-foreground" : "text-destructive"
            }`}
          >
            {formatCurrency(summary.remainingBalance, currencySymbol)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Current available fund
          </p>
        </CardContent>
      </Card>

      {/* Card 6: Total Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Transactions
          </CardTitle>
          <HugeiconsIcon
            icon={ReceiptTextIcon}
            className="h-3.5 w-3.5 text-muted-foreground"
          />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-foreground">
            {summary.totalTransactions}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Total activities logged
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
