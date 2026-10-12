import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { formatMonthYear, formatCurrency } from "@/lib/utils";
import type {
  DailyAnalyticItem,
  CategoryBreakdownItem,
  SourceBreakdownItem,
} from "@/types/api";

const INCOME_COLORS: Record<string, string> = {
  SALARY: "#1aae39",
  INVESTMENT: "#0075de",
  PART_TIME: "#2a9d99",
  FREELANCE: "#62aef0",
  BONUS: "#d6b6f6",
  GIFT: "#ff64c8",
  BUSINESS: "#dd5b00",
  OTHER: "#a39e98",
};

const EXPENSE_COLORS: Record<string, string> = {
  SHOPPING: "#ff64c8",
  FOOD: "#dd5b00",
  PHONE: "#62aef0",
  ENTERTAINMENT: "#d6b6f6",
  EDUCATION: "#0075de",
  BEAUTY: "#ff64c8",
  TRANSPORTATION: "#2a9d99",
  CLOTHING: "#d6b6f6",
  VEHICLE: "#523410",
  DRINKS: "#dd5b00",
  CIGARRETES: "#615d59",
  ELECTRONICS: "#391c57",
  TRAVEL: "#0075de",
  HEALTH: "#1aae39",
  PETS: "#793400",
  REPAIRS: "#523410",
  HOUSING: "#213183",
  SNACKS: "#dd5b00",
  GROCERIES: "#1aae39",
  PERSONAL: "#d6b6f6",
  OTHER: "#a39e98",
};

const FALLBACK_INCOME = "#2a9d99";
const FALLBACK_EXPENSE = "#dd5b00";

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: {
      label?: string;
      amount?: number;
      percentage?: number;
    };
  }>;
  currencySymbol: string;
}

function CustomPieTooltip({
  active,
  payload,
  currencySymbol,
}: CustomPieTooltipProps) {
  if (active && payload && payload.length > 0) {
    const item = payload[0];
    const label = item.payload?.label || item.name || "Item";
    const amount = Number(item.value ?? item.payload?.amount ?? 0);
    const percentage = item.payload?.percentage;

    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
        <div className="font-semibold text-popover-foreground">{label}</div>
        <div className="mt-0.5 font-mono text-muted-foreground">
          {formatCurrency(amount, currencySymbol)}
          {typeof percentage === "number" && !isNaN(percentage) && (
            <span className="ml-1.5 text-[11px] text-muted-foreground/80">
              ({percentage.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
}

interface DashboardChartsProps {
  year: number;
  month: number;
  dailyAnalytics: DailyAnalyticItem[];
  expenseCategoryBreakdown: CategoryBreakdownItem[];
  incomeSourceBreakdown: SourceBreakdownItem[];
  currencySymbol: string;
}

export function DashboardCharts({
  year,
  month,
  dailyAnalytics,
  expenseCategoryBreakdown,
  incomeSourceBreakdown,
  currencySymbol,
}: DashboardChartsProps) {
  const monthName = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
  });

  const hasDailyActivity =
    Boolean(dailyAnalytics?.length) &&
    dailyAnalytics.some((item) => item.income > 0 || item.expense > 0);

  const formattedExpenseData = expenseCategoryBreakdown.map((item) => ({
    ...item,
    label:
      item.category.charAt(0) +
      item.category.slice(1).toLowerCase().replace(/_/g, " "),
    fill: item.color || EXPENSE_COLORS[item.category] || FALLBACK_EXPENSE,
  }));

  const formattedIncomeData = incomeSourceBreakdown.map((item) => ({
    ...item,
    label:
      item.source.charAt(0) +
      item.source.slice(1).toLowerCase().replace(/_/g, " "),
    fill: item.color || INCOME_COLORS[item.source] || FALLBACK_INCOME,
  }));

  return (
    <>
      {/* Area Chart: Daily Income vs Expense */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground">
            Daily Income vs. Expense
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Day-by-day financial activity comparison for{" "}
            {formatMonthYear(year, month)}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          {hasDailyActivity ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyAnalytics}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1aae39" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1aae39" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="expenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#eb5757" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#eb5757" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#a39e98"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#a39e98" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: "var(--foreground)",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  labelFormatter={(day) => `${day} ${monthName}`}
                  formatter={(
                    value:
                      | number
                      | string
                      | readonly (string | number)[]
                      | undefined,
                    name: unknown,
                  ) => [
                    formatCurrency(Number(value) || 0, currencySymbol),
                    `${name}`,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#1aae39"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#eb5757"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={Activity}
                title="No daily activity yet"
                description={`No income or expense activity recorded for ${formatMonthYear(year, month)}.`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Breakdown Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Category Pie */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              Expense Category Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Where your money went this month
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center">
            {expenseCategoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedExpenseData}
                    dataKey="amount"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  />
                  <Tooltip
                    content={<CustomPieTooltip currencySymbol={currencySymbol} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={TrendingDown}
                title="No expenses"
                description="No expenses recorded for this month."
                className="p-4"
              />
            )}
          </CardContent>
        </Card>

        {/* Income Source Pie */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              Income Source Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Where earnings came from this month
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center">
            {incomeSourceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedIncomeData}
                    dataKey="amount"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  />
                  <Tooltip
                    content={<CustomPieTooltip currencySymbol={currencySymbol} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No income"
                description="No earnings recorded for this month."
                className="p-4"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
