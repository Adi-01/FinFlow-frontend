"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePaymentMethod } from "@/lib/hooks/mutations/usePaymentMethodMutations";
import { AVAILABLE_ICONS, getCategoryIcon } from "@/components/shared/iconHelper";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const paymentMethodSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(50, "Name is too long."),
  icon: z.string().min(1, "Icon is required."),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface AddCustomPaymentMethodModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customCount: number;
  maxLimit: number;
}

export function AddCustomPaymentMethodModal({
  isOpen,
  onOpenChange,
  customCount,
  maxLimit,
}: AddCustomPaymentMethodModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      icon: "CreditCard",
    },
  });

  const selectedIcon = watch("icon");
  const isLimitReached = customCount >= maxLimit;

  const createMutation = useCreatePaymentMethod(() => {
    reset();
    setErrorMsg(null);
    onOpenChange(false);
  });

  const onSubmit = (values: PaymentMethodFormValues) => {
    if (isLimitReached) {
      setErrorMsg(`Limit of ${maxLimit} custom payment methods reached.`);
      return;
    }
    setErrorMsg(null);
    createMutation.mutate(values, {
      onError: (err) => {
        setErrorMsg(err.message || "Failed to create payment method");
      },
    });
  };

  const SelectedIconComponent = getCategoryIcon(selectedIcon);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Add Custom Payment Method
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a custom payment option with icon for your transaction logs.
          </DialogDescription>
        </DialogHeader>

        {isLimitReached && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Quota reached: You have created {customCount}/{maxLimit} custom payment methods. Delete one to create more.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="method-name" className="text-xs">Method Name</Label>
            <Input
              id="method-name"
              placeholder="e.g. Apple Pay, PayPal, Crypto Wallet"
              {...register("name")}
              className="h-8.5 text-xs"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Icon</Label>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Preview: <SelectedIconComponent className="h-4 w-4 text-foreground" />
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1.5 border border-border rounded-lg bg-muted/20">
              {Object.entries(AVAILABLE_ICONS).map(([iconName, IconComp]) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setValue("icon", iconName)}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md border transition-colors cursor-pointer",
                    selectedIcon === iconName
                      ? "border-primary bg-background text-foreground shadow-xs"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" className="h-8.5 px-4 text-xs">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={isLimitReached || createMutation.isPending}
              className="h-8.5 px-4 text-xs"
            >
              {createMutation.isPending ? "Creating..." : "Save Payment Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
