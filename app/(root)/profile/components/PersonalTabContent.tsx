"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserPaymentMethod } from "@/types/api";

const CURRENCY_OPTIONS = [
  { label: "US Dollar ($)", value: "$" },
  { label: "Euro (€)", value: "€" },
  { label: "British Pound (£)", value: "£" },
  { label: "Japanese Yen (¥)", value: "¥" },
  { label: "Indian Rupee (₹)", value: "₹" },
];

const SYSTEM_PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

interface PersonalTabContentProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  dob: string;
  setDob: (val: string) => void;
  currencySymbol: string;
  setCurrencySymbol: (val: string) => void;
  startingAllowance: string;
  setStartingAllowance: (val: string) => void;
  defaultPaymentMethod: string;
  setDefaultPaymentMethod: (val: string) => void;
  customPaymentMethods?: UserPaymentMethod[];
  profileImage?: string | null;
}

export function PersonalTabContent({
  name,
  setName,
  email,
  dob,
  setDob,
  currencySymbol,
  setCurrencySymbol,
  startingAllowance,
  setStartingAllowance,
  defaultPaymentMethod,
  setDefaultPaymentMethod,
  customPaymentMethods = [],
  profileImage,
}: PersonalTabContentProps) {
  const todayDateString = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-foreground">Personal Information</h2>
          <p className="text-xs text-muted-foreground">
            Update your personal details and profile information.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm bg-transparent"
              placeholder="Your full name"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              value={email}
              disabled
              className="h-10 text-sm bg-muted/30 cursor-not-allowed opacity-80"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-xs font-medium text-foreground">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              max={todayDateString}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="h-10 text-sm bg-transparent"
            />
          </div>

          {/* Base Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-xs font-medium text-foreground">
              Base Currency
            </Label>
            <Select value={currencySymbol} onValueChange={setCurrencySymbol}>
              <SelectTrigger
                id="currency"
                className="w-full h-10 !h-10 data-[size=default]:h-10 text-sm bg-transparent"
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Financial Preferences Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-foreground">Financial Preferences</h2>
          <p className="text-xs text-muted-foreground">
            Set defaults to speed up transaction logging.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Monthly Starting Allowance */}
          <div className="space-y-2">
            <Label htmlFor="allowance" className="text-xs font-medium text-foreground">
              Monthly Starting Allowance
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currencySymbol || "$"}
              </span>
              <Input
                id="allowance"
                type="number"
                min="0"
                step="any"
                value={startingAllowance}
                onChange={(e) => setStartingAllowance(e.target.value)}
                className="h-10 pl-7 text-sm bg-transparent"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your baseline amount available at the start of each month.
            </p>
          </div>

          {/* Default Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="default-pm" className="text-xs font-medium text-foreground">
              Default Payment Method
            </Label>
            <Select
              value={defaultPaymentMethod}
              onValueChange={setDefaultPaymentMethod}
            >
              <SelectTrigger
                id="default-pm"
                className="w-full h-10 !h-10 data-[size=default]:h-10 text-sm bg-transparent"
              >
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {/* System methods */}
                {SYSTEM_PAYMENT_METHODS.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label} (System)
                  </SelectItem>
                ))}
                {/* Custom methods */}
                {customPaymentMethods.map((pm) => (
                  <SelectItem key={pm.id} value={pm.name}>
                    {pm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Pre-selected when recording new transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

