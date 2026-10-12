"use client";

import { useState } from "react";
import { Plus, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/components/shared/iconHelper";
import { AddCustomCategoryModal } from "@/components/shared/AddCustomCategoryModal";
import { AddCustomPaymentMethodModal } from "@/components/shared/AddCustomPaymentMethodModal";
import { useCategories } from "@/lib/hooks/queries/useCategoryQueries";
import { usePaymentMethods } from "@/lib/hooks/queries/usePaymentMethodQueries";
import { useDeleteCategory } from "@/lib/hooks/mutations/useCategoryMutations";
import { useDeletePaymentMethod } from "@/lib/hooks/mutations/usePaymentMethodMutations";

export function CollectionsTabContent() {
  const { data: categoriesData } = useCategories();
  const { data: paymentMethodsData } = usePaymentMethods();

  const deleteCategoryMutation = useDeleteCategory();
  const deletePaymentMethodMutation = useDeletePaymentMethod();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);

  const maxLimit = 10;
  const customCategories = categoriesData?.custom || [];
  const customExpenseCategories = customCategories.filter((c) => c.type === "EXPENSE");
  const customIncomeSources = customCategories.filter((c) => c.type === "INCOME");
  const customPaymentMethods = paymentMethodsData?.custom || [];

  const expenseCount = customExpenseCategories.length;
  const incomeCount = customIncomeSources.length;
  const pmCount = customPaymentMethods.length;

  return (
    <div className="space-y-6">
      {/* Custom Categories Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-foreground">Custom Categories</h2>
          <p className="text-xs text-muted-foreground">
            Manage your personalized income and expense categories.
          </p>
        </div>

        <div className="space-y-6">
          {/* Expenses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Expense Categories ({expenseCount}/{maxLimit})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryModalType("EXPENSE");
                  setIsCategoryModalOpen(true);
                }}
                disabled={expenseCount >= maxLimit}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Plus className="size-3" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {customExpenseCategories.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  No custom expense categories added yet.
                </span>
              ) : (
                customExpenseCategories.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon);
                  return (
                    <div
                      key={cat.id}
                      className="inline-flex items-center gap-2 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        disabled={deleteCategoryMutation.isPending}
                        className="rounded-full p-0.5 text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                        title="Delete category"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Income Sources */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Income Sources ({incomeCount}/{maxLimit})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryModalType("INCOME");
                  setIsCategoryModalOpen(true);
                }}
                disabled={incomeCount >= maxLimit}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Plus className="size-3" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {customIncomeSources.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  No custom income sources added yet.
                </span>
              ) : (
                customIncomeSources.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon);
                  return (
                    <div
                      key={cat.id}
                      className="inline-flex items-center gap-2 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        disabled={deleteCategoryMutation.isPending}
                        className="rounded-full p-0.5 text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                        title="Delete income source"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Payment Methods Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-foreground">Custom Payment Methods</h2>
          <p className="text-xs text-muted-foreground">
            Manage your custom accounts, cards, and payment options.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Methods ({pmCount}/{maxLimit})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaymentMethodModalOpen(true)}
              disabled={pmCount >= maxLimit}
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {customPaymentMethods.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">
                No custom payment methods added yet.
              </span>
            ) : (
              customPaymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="inline-flex items-center gap-2 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  <span>{pm.name}</span>
                  <button
                    type="button"
                    onClick={() => deletePaymentMethodMutation.mutate(pm.id)}
                    disabled={deletePaymentMethodMutation.isPending}
                    className="rounded-full p-0.5 text-muted-foreground hover:text-destructive cursor-pointer ml-1"
                    title="Delete payment method"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Creation Modals */}
      <AddCustomCategoryModal
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        defaultType={categoryModalType}
        incomeCount={incomeCount}
        expenseCount={expenseCount}
        maxLimit={maxLimit}
      />

      <AddCustomPaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onOpenChange={setIsPaymentMethodModalOpen}
        customCount={pmCount}
        maxLimit={maxLimit}
      />
    </div>
  );
}
