"use client";

import { useState } from "react";
import { WheelPicker } from "@/components/motion/wheel-picker";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils";

export const MONTH_OPTIONS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const currentCalendarYear = new Date().getFullYear();
const currentCalendarMonth = new Date().getMonth() + 1;

// Range of 11 years (10 years in the past up to current year, no future years)
export const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const y = currentCalendarYear - 10 + i;
  return { label: String(y), value: String(y) };
});

export interface MonthYearWheelPickerProps {
  year: number;
  month: number;
  onApply: (year: number, month: number) => void;
  onCancel?: () => void;
}

export function MonthYearWheelPicker({
  year,
  month,
  onApply,
  onCancel,
}: MonthYearWheelPickerProps) {
  // Clamp initial values if in future
  const initialYear = Math.min(year, currentCalendarYear);
  const initialMonth =
    initialYear === currentCalendarYear
      ? Math.min(month, currentCalendarMonth)
      : month;

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [prevProps, setPrevProps] = useState({ year, month });

  if (prevProps.year !== year || prevProps.month !== month) {
    setPrevProps({ year, month });
    const clampedY = Math.min(year, currentCalendarYear);
    const clampedM =
      clampedY === currentCalendarYear
        ? Math.min(month, currentCalendarMonth)
        : month;
    setSelectedYear(clampedY);
    setSelectedMonth(clampedM);
  }

  // Dynamically filter months for the current calendar year
  const availableMonthOptions =
    selectedYear === currentCalendarYear
      ? MONTH_OPTIONS.filter((m) => Number(m.value) <= currentCalendarMonth)
      : MONTH_OPTIONS;

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    if (newYear === currentCalendarYear && selectedMonth > currentCalendarMonth) {
      setSelectedMonth(currentCalendarMonth);
    }
  };

  const previewName = formatMonthYear(selectedYear, selectedMonth);
  const isCurrentMonthSelected =
    selectedYear === currentCalendarYear &&
    selectedMonth === currentCalendarMonth;

  const handleApply = () => {
    let finalYear = selectedYear;
    let finalMonth = selectedMonth;
    if (
      finalYear > currentCalendarYear ||
      (finalYear === currentCalendarYear && finalMonth > currentCalendarMonth)
    ) {
      finalYear = currentCalendarYear;
      finalMonth = currentCalendarMonth;
    }
    onApply(finalYear, finalMonth);
  };

  const handleResetToCurrent = () => {
    setSelectedYear(currentCalendarYear);
    setSelectedMonth(currentCalendarMonth);
  };

  return (
    <div className="w-72 p-3 space-y-3 bg-card rounded-xl">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <p className="text-xs font-semibold text-foreground">Select Month & Year</p>
          <p className="text-[11px] text-muted-foreground font-mono">{previewName}</p>
        </div>
        {!isCurrentMonthSelected && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleResetToCurrent}
            className="text-[11px] h-6 px-2 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
          >
            This Month
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
            Month
          </p>
          <WheelPicker
            options={availableMonthOptions}
            value={String(selectedMonth)}
            onValueChange={(val) => setSelectedMonth(Number(val))}
            visibleCount={5}
            itemHeight={34}
            sound={true}
          />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
            Year
          </p>
          <WheelPicker
            options={YEAR_OPTIONS}
            value={String(selectedYear)}
            onValueChange={(val) => handleYearChange(Number(val))}
            visibleCount={5}
            itemHeight={34}
            sound={true}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onCancel}
            className="text-xs h-8 px-3 cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          type="button"
          onClick={handleApply}
          className="text-xs h-8 px-4 font-semibold cursor-pointer"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
