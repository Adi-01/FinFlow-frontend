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
import { useCreateCategory } from "@/lib/hooks/mutations/useCategoryMutations";
import {
  COLOR_PALETTE,
  CATEGORY_ICON_GROUPS,
  getCategoryIcon,
} from "@/components/shared/iconHelper";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(50, "Name is too long."),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().min(1, "Icon is required."),
  color: z.string().min(1, "Color is required."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface AddCustomCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "INCOME" | "EXPENSE";
  incomeCount: number;
  expenseCount: number;
  maxLimit: number;
}

export function AddCustomCategoryModal({
  isOpen,
  onOpenChange,
  defaultType = "EXPENSE",
  incomeCount,
  expenseCount,
  maxLimit,
}: AddCustomCategoryModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: defaultType,
      icon: "Briefcase",
      color: "#6366F1",
    },
  });

  const selectedType = watch("type");
  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const currentCount = selectedType === "INCOME" ? incomeCount : expenseCount;
  const isLimitReached = currentCount >= maxLimit;

  const createCategoryMutation = useCreateCategory(() => {
    reset();
    setErrorMsg(null);
    onOpenChange(false);
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (isLimitReached) {
      setErrorMsg(`Limit of ${maxLimit} custom ${selectedType.toLowerCase()} categories reached.`);
      return;
    }
    setErrorMsg(null);
    createCategoryMutation.mutate(values, {
      onError: (err) => {
        setErrorMsg(err.message || "Failed to create category");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Add Custom {selectedType === "INCOME" ? "Income Source" : "Expense Category"}
          </DialogTitle>
        </DialogHeader>

        {isLimitReached && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Quota reached: You have created {currentCount}/{maxLimit} custom {selectedType.toLowerCase()} categories. Delete one to create more.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Type Segmented Toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <div className="inline-flex h-8 w-full items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setValue("type", "EXPENSE")}
                className={cn(
                  "flex-1 rounded-[4px] py-1 text-center transition-colors",
                  selectedType === "EXPENSE"
                    ? "bg-background text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "INCOME")}
                className={cn(
                  "flex-1 rounded-[4px] py-1 text-center transition-colors",
                  selectedType === "INCOME"
                    ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Income Source
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-xs">Name</Label>
            <Input
              id="category-name"
              placeholder="e.g. Crypto, Side Hustle, Gaming"
              {...register("name")}
              className="h-8.5 text-xs"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Chart Color</Label>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {COLOR_PALETTE.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setValue("color", hex)}
                  className={cn(
                    "size-8 rounded-full transition-transform cursor-pointer",
                    selectedColor === hex ? "scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs mb-0.5">Category Icon</Label>
            <div className="max-h-52 overflow-y-auto space-y-3.5 p-2 border border-border rounded-lg bg-muted/20">
              {CATEGORY_ICON_GROUPS.map((group) => (
                <div key={group.id} className="space-y-1.5">
                  <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-0.5 text-center">
                    {group.name}
                  </h4>
                  <div className="grid grid-cols-7 gap-1 place-items-center">
                    {group.icons.map(({ name: iconName, icon: IconComp }) => {
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setValue("icon", iconName)}
                          title={iconName}
                          aria-label={iconName}
                          className="p-1 border-0 bg-transparent cursor-pointer flex items-center justify-center outline-none focus:outline-none"
                        >
                          {/* Inner container strictly forced to a circle */}
                          <span
                            className={cn(
                              "size-10 rounded-full flex items-center justify-center transition-all",
                              isSelected
                                ? "bg-foreground text-background shadow-sm scale-110"
                                : "bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                            )}
                          >
                            <IconComp className="h-5 w-5 shrink-0" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
              disabled={isLimitReached || createCategoryMutation.isPending}
              className="h-8.5 px-4 text-xs"
            >
              {createCategoryMutation.isPending ? "Creating..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
