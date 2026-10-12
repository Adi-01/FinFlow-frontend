import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Universal Currency Formatter
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = "$",
  decimals: number = 2,
): string {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${currencySymbol}${formattedNumber}`;
}

/**
 * Standardized Date Formatter
 */
export function formatDate(
  dateInput: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
}

/**
 * Standardized Date and Time Formatter (e.g., "Oct 9, 2026, 12:34 AM")
 */
export function formatDateTime(
  dateInput: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return formatDate(dateInput, defaultOptions);
}


/**
 * Format Month & Year for Header Display (e.g., "August 2026")
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Parse URL Query Month string ("YYYY-MM") into numbers { year, month }
 */
export function parseMonthString(monthStr?: string | null): {
  year: number;
  month: number;
} {
  const now = new Date();
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  }

  const [yearStr, mStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
  }

  return { year, month };
}

/**
 * Format { year, month } into URL month string ("YYYY-MM")
 */
export function formatMonthString(year: number, month: number): string {
  const formattedMonth = month.toString().padStart(2, "0");
  return `${year}-${formattedMonth}`;
}

export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Builds URLSearchParams for transaction queries (safe for client and server)
 */
export function buildTransactionQueryParams(filters: {
  month?: string | number;
  year?: number;
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (filters.month) {
    const monthVal =
      typeof filters.month === "number" && filters.year
        ? `${filters.year}-${String(filters.month).padStart(2, "0")}`
        : filters.month.toString();
    queryParams.append("month", monthVal);
  } else if (filters.year) {
    queryParams.append("year", filters.year.toString());
  }

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.type && filters.type !== "ALL") queryParams.append("type", filters.type);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
  if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount > 0) {
    queryParams.append("minAmount", filters.minAmount.toString());
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount > 0) {
    queryParams.append("maxAmount", filters.maxAmount.toString());
  }
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  return queryParams;
}

/**
 * Builds URLSearchParams for income queries (safe for client and server)
 */
export function buildIncomeQueryParams(filters: {
  month?: string | number;
  year?: number;
  page?: number;
  limit?: number;
  source?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (filters.month) {
    const monthVal =
      typeof filters.month === "number" && filters.year
        ? `${filters.year}-${String(filters.month).padStart(2, "0")}`
        : filters.month.toString();
    queryParams.append("month", monthVal);
  } else if (filters.year) {
    queryParams.append("year", filters.year.toString());
  }

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.source) queryParams.append("source", filters.source);
  if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
  if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount > 0) {
    queryParams.append("minAmount", filters.minAmount.toString());
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount > 0) {
    queryParams.append("maxAmount", filters.maxAmount.toString());
  }
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  return queryParams;
}

/**
 * Builds URLSearchParams for expense queries (safe for client and server)
 */
export function buildExpenseQueryParams(filters: {
  month?: string | number;
  year?: number;
  page?: number;
  limit?: number;
  category?: string;
  categories?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (filters.month) {
    const monthVal =
      typeof filters.month === "number" && filters.year
        ? `${filters.year}-${String(filters.month).padStart(2, "0")}`
        : filters.month.toString();
    queryParams.append("month", monthVal);
  } else if (filters.year) {
    queryParams.append("year", filters.year.toString());
  }

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.categories) queryParams.append("categories", filters.categories);
  if (filters.paymentMethod) queryParams.append("paymentMethod", filters.paymentMethod);
  if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount > 0) {
    queryParams.append("minAmount", filters.minAmount.toString());
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount > 0) {
    queryParams.append("maxAmount", filters.maxAmount.toString());
  }
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.search?.trim()) queryParams.append("search", filters.search.trim());
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

  return queryParams;
}

/**
 * Returns the maximum selectable date string (YYYY-MM-DD) for transactions,
 * corresponding to the last day of the current calendar month.
 */
export function getCurrentMonthMaxDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const monthStr = month.toString().padStart(2, "0");
  const dayStr = lastDay.toString().padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
}


