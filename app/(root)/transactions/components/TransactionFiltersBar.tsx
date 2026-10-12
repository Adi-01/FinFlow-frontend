"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  RotateCcw,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatMonthYear,
  formatMonthString,
  getPreviousMonth,
  getNextMonth,
  getDaysInMonth,
  formatDate,
} from "@/lib/utils";
import {
  IncomeSource,
  ExpenseCategory,
  PaymentMethod,
  type TransactionFilters,
} from "@/types/api";
import { useCategories } from "@/lib/hooks/queries/useCategoryQueries";
import { usePaymentMethods } from "@/lib/hooks/queries/usePaymentMethodQueries";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  currencySymbol: string;
  onFilterChange: (newFilters: Partial<TransactionFilters>) => void;
  onResetFilters: () => void;
}

export function TransactionFiltersBar({
  filters,
  currencySymbol,
  onFilterChange,
  onResetFilters,
}: TransactionFiltersBarProps) {
  const [hasOpenedFilter, setHasOpenedFilter] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Lazy load filter metadata (categories and payment methods) only when user opens the dialog, hovers the filter button, or has active category/paymentMethod filter
  const isFilterDataNeeded =
    isDialogOpen ||
    hasOpenedFilter ||
    Boolean(filters.category || filters.paymentMethod);

  const { data: categoriesData } = useCategories(undefined, {
    enabled: isFilterDataNeeded,
  });
  const { data: paymentMethodsData } = usePaymentMethods({
    enabled: isFilterDataNeeded,
  });

  const expenseCategories = [
    ...(categoriesData?.system?.expense?.map((item) => ({
      name: item.name,
      label: item.label,
    })) ||
      Object.values(ExpenseCategory).map((cat) => ({
        name: cat,
        label: cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, " "),
      }))),
    ...(categoriesData?.custom
      ?.filter((c) => c.type === "EXPENSE")
      .map((c) => ({
        name: c.name,
        label: c.name,
      })) || []),
  ];

  const incomeSources = [
    ...(categoriesData?.system?.income?.map((item) => ({
      name: item.name,
      label: item.label,
    })) ||
      Object.values(IncomeSource).map((src) => ({
        name: src,
        label: src.charAt(0) + src.slice(1).toLowerCase().replace(/_/g, " "),
      }))),
    ...(categoriesData?.custom
      ?.filter((c) => c.type === "INCOME")
      .map((c) => ({
        name: c.name,
        label: c.name,
      })) || []),
  ];

  const paymentMethodsList = [
    ...(paymentMethodsData?.system?.map((item) => ({
      name: item.name,
      label: item.label,
    })) ||
      Object.values(PaymentMethod).map((pm) => ({
        name: pm,
        label: pm.charAt(0) + pm.slice(1).toLowerCase().replace(/_/g, " "),
      }))),
    ...(paymentMethodsData?.custom?.map((pm) => ({
      name: pm.name,
      label: pm.name,
    })) || []),
  ];

  // Resolve year and month from filters
  const currentYear =
    filters.year ??
    (typeof filters.month === "string"
      ? parseInt(filters.month.split("-")[0], 10)
      : new Date().getFullYear());
  const currentMonth =
    typeof filters.month === "number"
      ? filters.month
      : typeof filters.month === "string"
      ? parseInt(filters.month.split("-")[1], 10)
      : new Date().getMonth() + 1;

  const monthStr = formatMonthString(currentYear, currentMonth);
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const minMonthDate = `${monthStr}-01`;
  const maxMonthDate = `${monthStr}-${String(daysInCurrentMonth).padStart(2, "0")}`;

  // Internal state for search input (debounced)
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Temporary dialog state
  const [tempType, setTempType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    filters.type || "ALL"
  );
  const [tempMinAmount, setTempMinAmount] = useState<string>(
    filters.minAmount !== undefined ? String(filters.minAmount) : ""
  );
  const [tempMaxAmount, setTempMaxAmount] = useState<string>(
    filters.maxAmount !== undefined ? String(filters.maxAmount) : ""
  );
  const [tempStartDate, setTempStartDate] = useState<string>(
    filters.startDate || ""
  );
  const [tempEndDate, setTempEndDate] = useState<string>(
    filters.endDate || ""
  );
  const [tempCategory, setTempCategory] = useState<string>(
    filters.category || "ALL"
  );
  const [tempPaymentMethod, setTempPaymentMethod] = useState<string>(
    filters.paymentMethod || "ALL"
  );
  const [tempSortBy, setTempSortBy] = useState<"date" | "amount">(
    filters.sortBy || "date"
  );
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">(
    filters.sortOrder || "desc"
  );

  // Sync internal search input if parent filters change externally
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if ((filters.search || "") !== searchInput.trim()) {
        onFilterChange({
          search: searchInput.trim() || undefined,
          page: 1,
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  // Sync dialog state when opened
  const handleOpenDialog = (open: boolean) => {
    if (open) {
      setHasOpenedFilter(true);
      setTempType(filters.type || "ALL");
      setTempMinAmount(filters.minAmount !== undefined ? String(filters.minAmount) : "");
      setTempMaxAmount(filters.maxAmount !== undefined ? String(filters.maxAmount) : "");
      setTempStartDate(filters.startDate || "");
      setTempEndDate(filters.endDate || "");
      setTempCategory(filters.category || "ALL");
      setTempPaymentMethod(filters.paymentMethod || "ALL");
      setTempSortBy(filters.sortBy || "date");
      setTempSortOrder(filters.sortOrder || "desc");
    }
    setIsDialogOpen(open);
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    const { year, month } = getPreviousMonth(currentYear, currentMonth);
    onFilterChange({
      year,
      month: formatMonthString(year, month),
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });
  };

  const handleNextMonth = () => {
    const { year, month } = getNextMonth(currentYear, currentMonth);
    onFilterChange({
      year,
      month: formatMonthString(year, month),
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    onFilterChange({
      year,
      month: formatMonthString(year, month),
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });
  };

  // Preset Handlers
  const handleApplyDatePreset = (preset: "whole" | "firstHalf" | "secondHalf") => {
    if (preset === "whole") {
      setTempStartDate(minMonthDate);
      setTempEndDate(maxMonthDate);
    } else if (preset === "firstHalf") {
      setTempStartDate(minMonthDate);
      setTempEndDate(`${monthStr}-15`);
    } else if (preset === "secondHalf") {
      setTempStartDate(`${monthStr}-16`);
      setTempEndDate(maxMonthDate);
    }
  };

  // Apply Advanced Filters
  const handleApplyAdvancedFilters = () => {
    const parsedMin = tempMinAmount ? parseFloat(tempMinAmount) : undefined;
    const parsedMax = tempMaxAmount ? parseFloat(tempMaxAmount) : undefined;

    onFilterChange({
      type: tempType,
      startDate: tempStartDate || undefined,
      endDate: tempEndDate || undefined,
      minAmount: parsedMin && !isNaN(parsedMin) && parsedMin > 0 ? parsedMin : undefined,
      maxAmount: parsedMax && !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : undefined,
      category: tempCategory !== "ALL" ? tempCategory : undefined,
      paymentMethod: tempPaymentMethod !== "ALL" ? tempPaymentMethod : undefined,
      sortBy: tempSortBy,
      sortOrder: tempSortOrder,
      page: 1,
    });
    setIsDialogOpen(false);
  };

  // Active filter count for badge
  const activeAdvancedFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.minAmount !== undefined,
    filters.maxAmount !== undefined,
    filters.category,
    filters.paymentMethod,
    filters.sortBy && filters.sortBy !== "date",
    filters.sortOrder && filters.sortOrder !== "desc",
  ].filter(Boolean).length;

  const isCurrentMonth = () => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
  };

  const hasAnyFiltersActive =
    activeAdvancedFilterCount > 0 ||
    Boolean(filters.search) ||
    (filters.type && filters.type !== "ALL");

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
        {/* Center / Right: Type Toggle, Search, & Advanced Filter Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Segmented Pill */}
          <div className="inline-flex h-7.5 items-center rounded-md border border-border bg-muted p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onFilterChange({ type: "ALL", category: undefined, page: 1 })}
              className={`rounded-[4px] px-2.5 py-0.5 text-xs transition-colors cursor-pointer ${
                !filters.type || filters.type === "ALL"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ type: "INCOME", category: undefined, page: 1 })}
              className={`rounded-[4px] px-2.5 py-0.5 text-xs transition-colors cursor-pointer ${
                filters.type === "INCOME"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ type: "EXPENSE", category: undefined, page: 1 })}
              className={`rounded-[4px] px-2.5 py-0.5 text-xs transition-colors cursor-pointer ${
                filters.type === "EXPENSE"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Expense
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs bg-background"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Advanced Filter Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
              <Button
                variant={activeAdvancedFilterCount > 0 ? "secondary" : "outline"}
                size="sm"
                className="h-8 gap-1.5 text-xs font-normal"
                onMouseEnter={() => setHasOpenedFilter(true)}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeAdvancedFilterCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {activeAdvancedFilterCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Filter Transactions</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Narrow down transactions for {formatMonthYear(currentYear, currentMonth)}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-1">
                {/* 1. Date Range Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">Date Range</span>

                    {/* Presets */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleApplyDatePreset("whole")}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        All Month
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyDatePreset("firstHalf")}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        1st–15th
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyDatePreset("secondHalf")}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        16th–End
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* From Date */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">From Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-8.5 rounded-[4px] text-xs",
                              !tempStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                            {tempStartDate ? format(new Date(tempStartDate + "T12:00:00"), "dd-MMM-yy") : <span>Start date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempStartDate ? new Date(tempStartDate + "T12:00:00") : undefined}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                const offset = date.getTimezoneOffset();
                                const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
                                setTempStartDate(adjusted.toISOString().split("T")[0]);
                              } else {
                                setTempStartDate("");
                              }
                            }}
                            disabled={(date: Date) => {
                              const min = new Date(minMonthDate + "T00:00:00");
                              const max = tempEndDate ? new Date(tempEndDate + "T23:59:59") : new Date(maxMonthDate + "T23:59:59");
                              return date < min || date > max;
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">To Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-8.5 rounded-[4px] text-xs",
                              !tempEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                            {tempEndDate ? format(new Date(tempEndDate + "T12:00:00"), "dd-MMM-yy") : <span>End date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempEndDate ? new Date(tempEndDate + "T12:00:00") : undefined}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                const offset = date.getTimezoneOffset();
                                const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
                                setTempEndDate(adjusted.toISOString().split("T")[0]);
                              } else {
                                setTempEndDate("");
                              }
                            }}
                            disabled={(date: Date) => {
                              const min = tempStartDate ? new Date(tempStartDate + "T00:00:00") : new Date(minMonthDate + "T00:00:00");
                              const max = new Date(maxMonthDate + "T23:59:59");
                              return date < min || date > max;
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border my-3" />

                {/* 2. Amount Range Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">Amount Range ({currencySymbol})</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {tempMinAmount ? `${currencySymbol}${tempMinAmount}` : `${currencySymbol}0`} – {tempMaxAmount ? `${currencySymbol}${tempMaxAmount}` : "Any"}
                    </span>
                  </div>

                  <div className="px-1 py-1">
                    <Slider
                      min={0}
                      max={10000}
                      step={50}
                      value={[
                        tempMinAmount ? parseFloat(tempMinAmount) : 0,
                        tempMaxAmount ? parseFloat(tempMaxAmount) : 10000
                      ]}
                      onValueChange={(val: number[]) => {
                        setTempMinAmount(val[0] > 0 ? val[0].toString() : "");
                        setTempMaxAmount(val[1] < 10000 ? val[1].toString() : "");
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Min Amount</label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={tempMinAmount}
                        onChange={(e) => setTempMinAmount(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Max Amount</label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Any"
                        value={tempMaxAmount}
                        onChange={(e) => setTempMaxAmount(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border my-3" />

                {/* 3. Transaction Type & Category Section */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Transaction Type
                    </label>
                    <div className="inline-flex h-8 w-full items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setTempType("ALL");
                          setTempCategory("ALL");
                        }}
                        className={cn(
                          "flex-1 rounded-[4px] py-1 text-center transition-colors",
                          tempType === "ALL"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempType("INCOME");
                          setTempCategory("ALL");
                        }}
                        className={cn(
                          "flex-1 rounded-[4px] py-1 text-center transition-colors",
                          tempType === "INCOME"
                            ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempType("EXPENSE");
                          setTempCategory("ALL");
                        }}
                        className={cn(
                          "flex-1 rounded-[4px] py-1 text-center transition-colors",
                          tempType === "EXPENSE"
                            ? "bg-background text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Expense
                      </button>
                    </div>
                  </div>

                <div className="h-px bg-border my-3" />

                {/* 4. Category/Source & Payment Method (Side-by-Side Grid) */}
                <div className={cn("grid gap-3", tempType !== "ALL" ? "grid-cols-2" : "grid-cols-1")}>
                  {tempType !== "ALL" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        {tempType === "INCOME" ? "Income Source" : "Expense Category"}
                      </label>
                      <Select value={tempCategory} onValueChange={setTempCategory}>
                        <SelectTrigger className="h-8.5 text-xs">
                          <SelectValue placeholder={`All ${tempType === "INCOME" ? "Sources" : "Categories"}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All {tempType === "INCOME" ? "Sources" : "Categories"}</SelectItem>
                          {tempType === "EXPENSE" &&
                            expenseCategories.map((cat) => (
                              <SelectItem key={cat.name} value={cat.name}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          {tempType === "INCOME" &&
                            incomeSources.map((src) => (
                              <SelectItem key={src.name} value={src.name}>
                                {src.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Payment Method
                    </label>
                    <Select value={tempPaymentMethod} onValueChange={setTempPaymentMethod}>
                      <SelectTrigger className="h-8.5 text-xs">
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Methods</SelectItem>
                        {paymentMethodsList.map((pm) => (
                          <SelectItem key={pm.name} value={pm.name}>
                            {pm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Sorting
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={tempSortBy}
                        onValueChange={(val: "date" | "amount") => setTempSortBy(val)}
                      >
                        <SelectTrigger className="h-8.5 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Sort by Date</SelectItem>
                          <SelectItem value="amount">Sort by Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={tempSortOrder}
                        onValueChange={(val: "asc" | "desc") => setTempSortOrder(val)}
                      >
                        <SelectTrigger className="h-8.5 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">
                            {tempSortBy === "date" ? "Newest First" : "Highest First"}
                          </SelectItem>
                          <SelectItem value="asc">
                            {tempSortBy === "date" ? "Oldest First" : "Lowest First"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border flex flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempType("ALL");
                    setTempStartDate("");
                    setTempEndDate("");
                    setTempMinAmount("");
                    setTempMaxAmount("");
                    setTempCategory("ALL");
                    setTempPaymentMethod("ALL");
                    setTempSortBy("date");
                    setTempSortOrder("desc");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium underline-offset-4 hover:underline"
                >
                  Reset fields
                </button>
                <div className="flex items-center gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" className="h-8 px-4 text-xs">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button size="sm" onClick={handleApplyAdvancedFilters} className="h-8 px-4 text-xs">
                    Apply Filters
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reset All Filters button if active */}
          {hasAnyFiltersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Tags Bar (Notion Style) */}
      {hasAnyFiltersActive && (
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          <span className="text-xs text-muted-foreground mr-1">Active filters:</span>

          {/* Type Tag */}
          {filters.type && filters.type !== "ALL" && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Type: {filters.type}
              <button
                type="button"
                onClick={() => onFilterChange({ type: "ALL", page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Search Tag */}
          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Search: &quot;{filters.search}&quot;
              <button
                type="button"
                onClick={() => onFilterChange({ search: undefined, page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Date Range Tag */}
          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Date: {filters.startDate ? formatDate(filters.startDate) : "Start"} –{" "}
              {filters.endDate ? formatDate(filters.endDate) : "End"}
              <button
                type="button"
                onClick={() => onFilterChange({ startDate: undefined, endDate: undefined, page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Amount Range Tag */}
          {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Amount:{" "}
              {filters.minAmount !== undefined
                ? `${currencySymbol}${filters.minAmount}`
                : `${currencySymbol}0`}{" "}
              –{" "}
              {filters.maxAmount !== undefined
                ? `${currencySymbol}${filters.maxAmount}`
                : "Any"}
              <button
                type="button"
                onClick={() => onFilterChange({ minAmount: undefined, maxAmount: undefined, page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Category Tag */}
          {filters.category && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Category: {filters.category}
              <button
                type="button"
                onClick={() => onFilterChange({ category: undefined, page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Payment Method Tag */}
          {filters.paymentMethod && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Method: {filters.paymentMethod}
              <button
                type="button"
                onClick={() => onFilterChange({ paymentMethod: undefined, page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Non-default Sort Tag */}
          {(filters.sortBy !== "date" || filters.sortOrder !== "desc") && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              Sorted: {filters.sortBy === "amount" ? "Amount" : "Date"} (
              {filters.sortOrder === "asc" ? "Asc" : "Desc"})
              <button
                type="button"
                onClick={() => onFilterChange({ sortBy: "date", sortOrder: "desc", page: 1 })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Clear all link */}
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-muted-foreground underline hover:text-foreground ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
