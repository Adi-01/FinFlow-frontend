"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddExpense } from "@/lib/hooks/mutations/useTransactionMutations";
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
  ShoppingCart,
  Utensils,
  Smartphone,
  Tv,
  GraduationCap,
  Sparkles,
  Car,
  Shirt,
  Coffee,
  Flame,
  Laptop,
  Plane,
  HeartPulse,
  Dog,
  Wrench,
  Home,
  Cookie,
  ShoppingBag,
  User,
  CalendarIcon,
} from "lucide-react";
import { PaymentMethod, ExpenseCategory } from "@/types/api";
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

const ExpenseCategoryIcons: Record<ExpenseCategory, any> = {
  SHOPPING: ShoppingCart,
  FOOD: Utensils,
  PHONE: Smartphone,
  ENTERTAINMENT: Tv,
  EDUCATION: GraduationCap,
  BEAUTY: Sparkles,
  TRANSPORTATION: Car,
  CLOTHING: Shirt,
  VEHICLE: Car,
  DRINKS: Coffee,
  CIGARRETES: Flame,
  ELECTRONICS: Laptop,
  TRAVEL: Plane,
  HEALTH: HeartPulse,
  PETS: Dog,
  REPAIRS: Wrench,
  HOUSING: Home,
  SNACKS: Cookie,
  GROCERIES: ShoppingBag,
  PERSONAL: User,
  OTHER: MoreHorizontal,
};

const expenseSchema = z.object({
  ...baseSchema,
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

import { useState } from "react";
import { useBudgetPreview } from "@/lib/hooks/useBudgetPreview";
import { BudgetImpactBanner } from "@/components/shared/BudgetImpactBanner";
import { OverBudgetConfirmationModal } from "@/components/shared/OverBudgetConfirmationModal";

type ExpenseFormValues = z.infer<typeof expenseSchema>;

import { useMonthContext } from "@/components/providers/month-provider";
import { useUserContext } from "@/components/providers/user-provider";
import { useEffect, useMemo } from "react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { year, month } = useMonthContext();
  const { user } = useUserContext();
  const { data: categoriesData } = useCategories("EXPENSE");
  const { data: paymentMethodsData } = usePaymentMethods();

  const expenseCategories = [
    ...(categoriesData?.system?.expense?.map((item) => ({
      name: item.name,
      label: item.label,
      icon: item.icon,
      color: item.color,
      isCustom: false,
    })) ||
      Object.values(ExpenseCategory).map((cat) => ({
        name: cat,
        label: cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, " "),
        icon: ExpenseCategoryIcons[cat as ExpenseCategory] ? cat : "MoreHorizontal",
        color: undefined,
        isCustom: false,
      }))),
    ...(categoriesData?.custom
      ?.filter((c) => c.type === "EXPENSE")
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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<ExpenseFormValues | null>(null);

  const { mutate: addExpense, isPending } = useAddExpense(() => {
    expenseForm.reset();
    setIsConfirmOpen(false);
    setPendingData(null);
    onClose();
  });

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      amount: 0,
      category: "" as any,
      date: defaultDate,
      paymentMethod: preferredPaymentMethod as any,
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (preferredPaymentMethod && !expenseForm.getValues("paymentMethod")) {
        expenseForm.setValue("paymentMethod", preferredPaymentMethod as any);
      }
      expenseForm.setValue("date", defaultDate);
    }
  }, [isOpen, preferredPaymentMethod, defaultDate, expenseForm]);

  const watchedAmount = expenseForm.watch("amount");
  const watchedDate = expenseForm.watch("date");
  const watchedCategory = expenseForm.watch("category");
  const watchedPaymentMethod = expenseForm.watch("paymentMethod");

  const isFormValid =
    Boolean(watchedDate) &&
    Number(watchedAmount) > 0 &&
    Number(watchedAmount) <= 1000000 &&
    Boolean(watchedCategory) &&
    Boolean(watchedPaymentMethod);

  const budgetPreview = useBudgetPreview({
    date: watchedDate,
    amount: Number(watchedAmount) || 0,
    type: "EXPENSE",
  });

  function executeAddExpense(data: ExpenseFormValues) {
    addExpense({
      ...data,
      date: new Date(data.date).toISOString(),
    });
  }

  function onSubmit(data: ExpenseFormValues) {
    if (budgetPreview.isOverBudget) {
      setPendingData(data);
      setIsConfirmOpen(true);
      return;
    }
    executeAddExpense(data);
  }

  function handleConfirmOverBudget() {
    if (pendingData) {
      executeAddExpense(pendingData);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Log a new expense to your ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <BudgetImpactBanner
            {...budgetPreview}
            type="EXPENSE"
            amount={Number(watchedAmount) || 0}
          />
        </div>

        <form onSubmit={expenseForm.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Row 1: Date + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="date"
              control={expenseForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="expense-date">Date</Label>
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
              control={expenseForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
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

          {/* Row 2: Category + Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="category"
              control={expenseForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((item) => {
                        const Icon = getCategoryIcon(item.icon);
                        return (
                          <SelectItem
                            key={item.name}
                            value={item.name}
                            extra={
                              item.isCustom ? (
                                <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-medium">
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
              control={expenseForm.control}
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

          {/* Row 3: Description */}
          <Controller
            name="description"
            control={expenseForm.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="expense-description">
                  Description (Optional)
                </Label>
                <Input
                  id="expense-description"
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
            Save Expense
          </Button>
        </form>

        <OverBudgetConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmOverBudget}
          expenseAmount={Number(watchedAmount) || 0}
          currentRemaining={budgetPreview.currentRemaining}
          overBudgetAmount={budgetPreview.overBudgetAmount}
          currencySymbol={budgetPreview.currencySymbol}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
