"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/providers/user-provider";
import { useUpdateProfile } from "@/lib/hooks/mutations/useProfileMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CURRENCY_OPTIONS = [
  { label: "$ · US Dollar (USD)", value: "$" },
  { label: "€ · Euro (EUR)", value: "€" },
  { label: "£ · British Pound (GBP)", value: "£" },
  { label: "₹ · Indian Rupee (INR)", value: "₹" },
  { label: "¥ · Japanese Yen (JPY)", value: "¥" },
];

export function OnboardingClient() {
  const router = useRouter();
  const { user } = useUserContext();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [dob, setDob] = useState<string>("");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [monthlyStartingAllowance, setMonthlyStartingAllowance] = useState<string>("2000");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isOnboarding) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user && !user.isOnboarding) {
    return null;
  }

  const todayDateString = new Date().toISOString().split("T")[0];

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!dob) {
      setErrorMessage("Please select your date of birth.");
      return;
    }

    if (!currencySymbol) {
      setErrorMessage("Please select your primary currency.");
      return;
    }

    const allowanceNum = parseFloat(monthlyStartingAllowance);
    if (isNaN(allowanceNum) || allowanceNum <= 0) {
      setErrorMessage("Please enter a valid monthly allowance greater than zero.");
      return;
    }

    updateProfile(
      {
        dob,
        currencySymbol,
        monthlyStartingAllowance: allowanceNum,
        isOnboarding: false,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
          router.refresh();
        },
        onError: (err) => {
          setErrorMessage(err.message || "Failed to complete setup. Please try again.");
        },
      }
    );
  };

  const isAllowanceValid =
    Boolean(monthlyStartingAllowance) && parseFloat(monthlyStartingAllowance) > 0;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px] space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
            Profile setup
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure your birth date, currency, and baseline monthly allowance
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-none">
          {errorMessage && (
            <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCompleteOnboarding} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-xs font-medium text-foreground">
                Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                max={todayDateString}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={isPending}
                required
                className="h-8.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs font-medium text-foreground">
                Primary currency
              </Label>
              <Select
                value={currencySymbol}
                onValueChange={setCurrencySymbol}
                disabled={isPending}
              >
                <SelectTrigger id="currency" className="h-8.5 text-xs w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allowance" className="text-xs font-medium text-foreground">
                Monthly allowance
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none">
                  {currencySymbol || "$"}
                </span>
                <Input
                  id="allowance"
                  type="number"
                  min="1"
                  step="any"
                  value={monthlyStartingAllowance}
                  onChange={(e) => setMonthlyStartingAllowance(e.target.value)}
                  disabled={isPending}
                  required
                  placeholder="2000"
                  className="h-8.5 pl-7 text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your baseline monthly spending budget. You can adjust this anytime.
              </p>
            </div>

            <Button
              type="submit"
              variant="pill"
              disabled={isPending || !dob || !currencySymbol || !isAllowanceValid}
              className="w-full h-8.5 text-xs font-medium mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
