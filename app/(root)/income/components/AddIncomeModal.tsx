"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddIncome } from "@/lib/hooks/mutations/useTransactionMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CreditCard,
  Banknote,
  Building2,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Gift,
  Laptop,
  CalendarIcon,
} from "lucide-react";
import { PaymentMethod, IncomeSource } from "@/types/api";

import { getCurrentMonthMaxDate, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCategories } from "@/lib/hooks/queries/useCategoryQueries";
import { usePaymentMethods } from "@/lib/hooks/queries/usePaymentMethodQueries";
import { getCategoryIcon } from "@/components/shared/iconHelper";

const baseSchema = {
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(10000000, "Amount cannot exceed 10,000,000")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      "Amount cannot have more than 2 decimal places",
    ),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      const dateYear = d.getUTCFullYear();
      const dateMonth = d.getUTCMonth();
      return (
        dateYear < currentYear ||
        (dateYear === currentYear && dateMonth <= currentMonth)
      );
    }, "Date cannot be in a future month")
    .refine((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      return d >= new Date("2000-01-01T00:00:00.000Z");
    }, "Date cannot be earlier than 2000-01-01"),
  paymentMethod: z.string().min(1, "Payment method is required"),
};

const PaymentMethodIcons: Record<PaymentMethod, any> = {
  CASH: Banknote,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  BANK_TRANSFER: Building2,
  OTHER: MoreHorizontal,
};

const IncomeSourceIcons: Record<IncomeSource, any> = {
  SALARY: Briefcase,
  INVESTMENT: TrendingUp,
  PART_TIME: Briefcase,
  FREELANCE: Laptop,
  BONUS: Gift,
  GIFT: Gift,
  BUSINESS: Building2,
  OTHER: MoreHorizontal,
};

const incomeSchema = z.object({
  ...baseSchema,
  source: z.string().min(1, "Source is required"),
  notes: z.string().optional(),
});

import { useBudgetPreview } from "@/lib/hooks/useBudgetPreview";
import { BudgetImpactBanner } from "@/components/shared/BudgetImpactBanner";

type IncomeFormValues = z.infer<typeof incomeSchema>;

import { useMonthContext } from "@/components/providers/month-provider";
import { useUserContext } from "@/components/providers/user-provider";
import { useEffect, useMemo } from "react";

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
  const { year, month } = useMonthContext();
  const { user } = useUserContext();
  const { data: categoriesData } = useCategories("INCOME");
  const { data: paymentMethodsData } = usePaymentMethods();

  const incomeSources = [
    ...(categoriesData?.system?.income?.map((item) => ({
      name: item.name,
      label: item.label,
      icon: item.icon,
      color: item.color,
      isCustom: false,
    })) ||
      Object.values(IncomeSource).map((src) => ({
        name: src,
        label: src.charAt(0) + src.slice(1).toLowerCase().replace(/_/g, " "),
        icon: IncomeSourceIcons[src as IncomeSource] ? src : "MoreHorizontal",
        color: undefined,
        isCustom: false,
      }))),
    ...(categoriesData?.custom
      ?.filter((c) => c.type === "INCOME")
      .map((c) => ({
        name: c.name,
        label: c.name,
        icon: c.icon,
        color: c.color,
        isCustom: true,
      })) || []),
  ];

  const paymentMethodsList = [
    ...(paymentMethodsData?.system?.map((item) => ({
      name: item.name,
      label: item.label,
      icon: item.icon,
      isCustom: false,
    })) ||
      Object.values(PaymentMethod).map((pm) => ({
        name: pm,
        label: pm.charAt(0) + pm.slice(1).toLowerCase().replace(/_/g, " "),
        icon: pm,
        isCustom: false,
      }))),
    ...(paymentMethodsData?.custom?.map((pm) => ({
      name: pm.name,
      label: pm.name,
      icon: pm.icon,
      isCustom: true,
    })) || []),
  ];

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const minDate = new Date(year, month - 1, 1, 0, 0, 0);
  const lastDayDate = new Date(year, month - 1, daysInMonth, 23, 59, 59);
  const maxDate = isCurrentMonth ? now : lastDayDate;

  const defaultDate = isCurrentMonth
    ? now.toISOString().split("T")[0]
    : `${year}-${String(month).padStart(2, "0")}-01`;

  const preferredPaymentMethod = useMemo(() => {
    const preferred = user?.settings?.defaultPaymentMethod;
    if (!preferred) return "";
    const match = paymentMethodsList.find(
      (pm) => pm.name.toLowerCase() === preferred.toLowerCase(),
    );
    return match?.name || "";
  }, [user?.settings?.defaultPaymentMethod, paymentMethodsList]);

  const { mutate: addIncome, isPending } = useAddIncome(() => {
    incomeForm.reset();
    onClose();
  });

  const incomeForm = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema) as any,
    defaultValues: {
      amount: 0,
      source: "" as any,
      date: defaultDate,
      paymentMethod: preferredPaymentMethod as any,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (preferredPaymentMethod && !incomeForm.getValues("paymentMethod")) {
        incomeForm.setValue("paymentMethod", preferredPaymentMethod as any);
      }
      incomeForm.setValue("date", defaultDate);
    }
  }, [isOpen, preferredPaymentMethod, defaultDate, incomeForm]);

  const watchedAmount = incomeForm.watch("amount");
  const watchedDate = incomeForm.watch("date");
  const watchedSource = incomeForm.watch("source");
  const watchedPaymentMethod = incomeForm.watch("paymentMethod");

  const isFormValid =
    Boolean(watchedDate) &&
    Number(watchedAmount) > 0 &&
    Number(watchedAmount) <= 1000000 &&
    Boolean(watchedSource) &&
    Boolean(watchedPaymentMethod);

  const budgetPreview = useBudgetPreview({
    date: watchedDate,
    amount: Number(watchedAmount) || 0,
    type: "INCOME",
  });

  function onSubmit(data: IncomeFormValues) {
    addIncome({
      ...data,
      date: new Date(data.date).toISOString(),
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Log a new income to your ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <BudgetImpactBanner
            {...budgetPreview}
            type="INCOME"
            amount={Number(watchedAmount) || 0}
          />
        </div>

        <form onSubmit={incomeForm.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Row 1: Date + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="date"
              control={incomeForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="income-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value + "T12:00:00"), "dd-MMM-yy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const offset = date.getTimezoneOffset();
                            const adjustedDate = new Date(date.getTime() - (offset*60*1000));
                            field.onChange(adjustedDate.toISOString().split("T")[0]);
                          }
                        }}
                        disabled={(date) => {
                          return date < minDate || date > maxDate;
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <p className="text-xs font-medium text-destructive">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="amount"
              control={incomeForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="income-amount">Amount</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    max={1000000}
                    className="max-w-full"
                    {...field}
                    value={field.value as number}
                  />
                  {fieldState.invalid && (
                    <p className="text-xs font-medium text-destructive">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Row 2: Source + Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="source"
              control={incomeForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeSources.map((item) => {
                        const Icon = getCategoryIcon(item.icon);
                        return (
                          <SelectItem
                            key={item.name}
                            value={item.name}
                            extra={
                              item.isCustom ? (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                                  Custom
                                </span>
                              ) : undefined
                            }
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <p className="text-xs font-medium text-destructive">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="paymentMethod"
              control={incomeForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodsList.map((item) => {
                        const Icon = getCategoryIcon(item.icon);
                        return (
                          <SelectItem
                            key={item.name}
                            value={item.name}
                            extra={
                              item.isCustom ? (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                  Custom
                                </span>
                              ) : undefined
                            }
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <p className="text-xs font-medium text-destructive">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Row 3: Notes */}
          <Controller
            name="notes"
            control={incomeForm.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="income-notes">Notes (Optional)</Label>
                <Input
                  id="income-notes"
                  placeholder="Additional details..."
                  {...field}
                />
                {fieldState.invalid && (
                  <p className="text-xs font-medium text-destructive">
                    {fieldState.error?.message}
                  </p>
                )}
              </div>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending || !isFormValid}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Income
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
