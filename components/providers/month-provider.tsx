"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useUserContext } from "@/components/providers/user-provider";
import { useUpdateProfile } from "@/lib/hooks/mutations/useProfileMutations";

interface MonthContextValue {
  year: number;
  month: number;
  monthStr: string;
  setYearMonth: (year: number, month: number) => void;
  isCurrentMonth: boolean;
}

const MonthContext = createContext<MonthContextValue | undefined>(undefined);

function getCurrentCalendarYearMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

function formatYearMonthString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseMonthStringSafe(val?: string | null): {
  year: number;
  month: number;
} {
  const current = getCurrentCalendarYearMonth();
  if (!val || typeof val !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(val)) {
    return current;
  }
  const parts = val.split("-");
  const parsedYear = Number(parts[0]);
  const parsedMonth = Number(parts[1]);

  if (isNaN(parsedYear) || isNaN(parsedMonth)) {
    return current;
  }

  // Guard against future months
  if (
    parsedYear > current.year ||
    (parsedYear === current.year && parsedMonth > current.month)
  ) {
    return current;
  }

  return { year: parsedYear, month: parsedMonth };
}

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext();
  const { mutate: updateProfile } = useUpdateProfile();

  const initial = useMemo(() => {
    return parseMonthStringSafe(user?.settings?.selectedMonth);
  }, [user?.settings?.selectedMonth]);

  const [currentSelection, setCurrentSelection] = useState<{
    year: number;
    month: number;
  }>(initial);

  const [prevPersistedMonth, setPrevPersistedMonth] = useState<
    string | null | undefined
  >(user?.settings?.selectedMonth);

  // Sync state during render if user's persisted selectedMonth changes (e.g. from session refresh or login)
  if (user?.settings?.selectedMonth !== prevPersistedMonth) {
    setPrevPersistedMonth(user?.settings?.selectedMonth);
    const parsed = parseMonthStringSafe(user?.settings?.selectedMonth);
    if (
      currentSelection.year !== parsed.year ||
      currentSelection.month !== parsed.month
    ) {
      setCurrentSelection(parsed);
    }
  }

  const setYearMonth = useCallback(
    (newYear: number, newMonth: number) => {
      const current = getCurrentCalendarYearMonth();

      // Guard: Clamped against future months
      let targetYear = newYear;
      let targetMonth = newMonth;
      if (
        targetYear > current.year ||
        (targetYear === current.year && targetMonth > current.month)
      ) {
        targetYear = current.year;
        targetMonth = current.month;
      }

      // No-op if selecting the identical active month
      if (
        currentSelection.year === targetYear &&
        currentSelection.month === targetMonth
      ) {
        return;
      }

      setCurrentSelection({ year: targetYear, month: targetMonth });

      // Persist to user settings in PostgreSQL in background
      const monthStr = formatYearMonthString(targetYear, targetMonth);
      updateProfile({ selectedMonth: monthStr });
    },
    [currentSelection, updateProfile],
  );

  const monthStr = useMemo(
    () => formatYearMonthString(currentSelection.year, currentSelection.month),
    [currentSelection.year, currentSelection.month],
  );

  const isCurrentMonth = useMemo(() => {
    const current = getCurrentCalendarYearMonth();
    return (
      currentSelection.year === current.year &&
      currentSelection.month === current.month
    );
  }, [currentSelection.year, currentSelection.month]);

  const contextValue = useMemo<MonthContextValue>(
    () => ({
      year: currentSelection.year,
      month: currentSelection.month,
      monthStr,
      setYearMonth,
      isCurrentMonth,
    }),
    [
      currentSelection.year,
      currentSelection.month,
      monthStr,
      setYearMonth,
      isCurrentMonth,
    ],
  );

  return (
    <MonthContext.Provider value={contextValue}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonthContext(): MonthContextValue {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error("useMonthContext must be used within a MonthProvider");
  }
  return context;
}
