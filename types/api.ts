/**
 * Frontend Type Definitions derived strictly from Backend API Contracts (backend-endpoints.md)
 */

// ==========================================
// 1. Generic API Wrappers
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
}

export interface ApiErrorDetail {
  type: string;
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  error: ApiErrorDetail;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

// ==========================================
// 2. User & Settings Models
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  dob?: string | null;
  profileImage?: string | null;
  isOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
  joinedAt?: string;
  settings?: {
    currencySymbol: string;
    monthlyStartingAllowance?: number;
    defaultPaymentMethod?: string | null;
    selectedMonth?: string | null;
  } | null;
}

export interface UserProfileSettings {
  currencySymbol: string;
  monthlyStartingAllowance: number;
  defaultPaymentMethod: string | null;
  selectedMonth?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dob: string | null;
  profileImage?: string | null;
  isOnboarding: boolean;
  joinedAt: string;
  settings: UserProfileSettings;
  categories: UserCategory[];
  paymentMethods: UserPaymentMethod[];
}

export interface UpdateProfilePayload {
  name?: string;
  dob?: string | null;
  currencySymbol?: string;
  monthlyStartingAllowance?: number;
  defaultPaymentMethod?: string | null;
  selectedMonth?: string | null;
  isOnboarding?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountPayload {
  confirmation: "DELETE";
  password: string;
}

export interface AccountSession {
  sessionId: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface GetSessionsResponse {
  sessions: AccountSession[];
}

export interface AuthResponse {
  user: User;
  sessionToken: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  currencySymbol: string;
  monthlyStartingAllowance?: number;
  defaultPaymentMethod?: string | null;
  selectedMonth?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  currencySymbol: string;
}


// ==========================================
// 3. Monthly Allowance Models
// ==========================================

export interface MonthlyAllowance {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  isRollover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllowanceResponse {
  allowance: MonthlyAllowance;
}

export interface SetAllowancePayload {
  year: number;
  month: number;
  amount: number;
}

export interface AllowanceSummary {
  year: number;
  month: number;
  startingAllowance: number;
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
  extraIncome: number;
}

// ==========================================
// 4. Custom Categories & Payment Methods Models
// ==========================================

export interface UserCategory {
  id: string;
  userId: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemCategoryItem {
  name: string;
  label: string;
  icon: string;
  color: string;
}

export interface CategoryQuota {
  incomeCustomCount: number;
  expenseCustomCount: number;
  maxLimit: number;
}

export interface GetCategoriesResponse {
  system: {
    income: SystemCategoryItem[];
    expense: SystemCategoryItem[];
  };
  custom: UserCategory[];
  quota: CategoryQuota;
}

export interface CreateCategoryPayload {
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
}

export interface UserPaymentMethod {
  id: string;
  userId: string;
  name: string;
  icon: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemPaymentMethodItem {
  name: string;
  label: string;
  icon: string;
}

export interface PaymentMethodQuota {
  customCount: number;
  maxLimit: number;
}

export interface GetPaymentMethodsResponse {
  system: SystemPaymentMethodItem[];
  custom: UserPaymentMethod[];
  quota: PaymentMethodQuota;
}

export interface CreatePaymentMethodPayload {
  name: string;
  icon: string;
}

// ==========================================
// 5. Enums (System Defaults)
// ==========================================

export enum PaymentMethod {
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  OTHER = "OTHER",
}

export enum IncomeSource {
  SALARY = "SALARY",
  INVESTMENT = "INVESTMENT",
  PART_TIME = "PART_TIME",
  FREELANCE = "FREELANCE",
  BONUS = "BONUS",
  GIFT = "GIFT",
  BUSINESS = "BUSINESS",
  OTHER = "OTHER",
}

export enum ExpenseCategory {
  SHOPPING = "SHOPPING",
  FOOD = "FOOD",
  PHONE = "PHONE",
  ENTERTAINMENT = "ENTERTAINMENT",
  EDUCATION = "EDUCATION",
  BEAUTY = "BEAUTY",
  TRANSPORTATION = "TRANSPORTATION",
  CLOTHING = "CLOTHING",
  VEHICLE = "VEHICLE",
  DRINKS = "DRINKS",
  CIGARRETES = "CIGARRETES",
  ELECTRONICS = "ELECTRONICS",
  TRAVEL = "TRAVEL",
  HEALTH = "HEALTH",
  PETS = "PETS",
  REPAIRS = "REPAIRS",
  HOUSING = "HOUSING",
  SNACKS = "SNACKS",
  GROCERIES = "GROCERIES",
  PERSONAL = "PERSONAL",
  OTHER = "OTHER",
}

// ==========================================
// 6. Income Models
// ==========================================

export interface Income {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  source: string;
  date: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomePayload {
  amount: number;
  source: string;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateIncomePayload {
  amount?: number;
  source?: string;
  date?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface IncomeFilters {
  month?: string | number;
  year?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  source?: string;
  paymentMethod?: string;
  search?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// ==========================================
// 7. Expense Models
// ==========================================

export interface Expense {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  description?: string;
}

export interface UpdateExpensePayload {
  amount?: number;
  category?: string;
  date?: string;
  paymentMethod?: string;
  description?: string;
}

export interface ExpenseFilters {
  month?: string | number;
  year?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  categories?: string;
  paymentMethod?: string;
  search?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// ==========================================
// 8. Dashboard Analytics Models
// ==========================================

export interface DashboardSummary {
  startingAllowance: number;
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
  extraIncome: number;
  totalTransactions: number;
}

export interface DailyAnalyticItem {
  day: number;
  income: number;
  expense: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface SourceBreakdownItem {
  source: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface DashboardMetrics {
  year: number;
  month: number;
  allowance: MonthlyAllowance | null;
  summary: DashboardSummary;
  dailyAnalytics: DailyAnalyticItem[];
  expenseCategoryBreakdown: CategoryBreakdownItem[];
  incomeSourceBreakdown: SourceBreakdownItem[];
}

// ==========================================
// 9. Master Transactions Ledger Models
// ==========================================

export type TransactionType = "INCOME" | "EXPENSE";

export interface UnifiedTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryOrSource: string;
  date: string;
  paymentMethod: string;
  descriptionOrNotes?: string | null;
  createdAt: string;
}

export interface TransactionFilters {
  month?: string | number;
  year?: number;
  type?: "ALL" | "INCOME" | "EXPENSE";
  category?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// ==========================================
// 10. Reflect AI Report & Chat Models
// ==========================================

export interface ReflectPersonalityReveal {
  badge_emoji?: string;
  archetype_title: string;
  tagline: string;
  reveal_text: string;
}

export interface ReflectAtAGlance {
  starting_allowance: number;
  total_spent: number;
  extra_income: number;
  remaining_balance: number;
  summary_text: string;
}

export interface ReflectCategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: string;
}

export interface ReflectWhereMoneyWent {
  summary: string;
  breakdown: ReflectCategoryBreakdownItem[];
}

export interface ReflectSpendingHabit {
  title: string;
  description: string;
}

export interface ReflectPurchaseToNote {
  title: string;
  amount: number;
  note: string;
}

export interface ReflectIdeaForNextMonth {
  title: string;
  action: string;
}

export interface ReflectReportData {
  personality_reveal: ReflectPersonalityReveal;
  at_a_glance: ReflectAtAGlance;
  where_money_went: ReflectWhereMoneyWent;
  spending_habits: ReflectSpendingHabit[];
  purchases_to_note: ReflectPurchaseToNote[];
  ideas_for_next_month: ReflectIdeaForNextMonth[];
  chatHistory?: ChatReflectMessage[];
  transaction_count?: number;
}

export interface ReflectReport {
  id: string;
  year: number;
  month: number;
  data: ReflectReportData;
  createdAt: string;
  updatedAt: string;
  cached?: boolean;
}

export interface ReflectLimits {
  generate: {
    dailyUsed: number;
    dailyLimit: number;
    dailyRemaining: number;
    cooldownRemainingSeconds: number;
    canGenerate: boolean;
  };
  chat: {
    dailyUsed: number;
    dailyLimit: number;
    dailyRemaining: number;
    canChat: boolean;
  };
}

export interface GetReflectResponse {
  report: ReflectReport | null;
  transactionCount: number;
  limits: ReflectLimits;
}

export interface GenerateReflectPayload {
  year: number;
  month: number;
  regenerate?: boolean;
}

export interface ChatReflectMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatReflectPayload {
  reportId: string;
  message: string;
  history?: ChatReflectMessage[];
}

export interface ChatReflectResponse {
  reportId: string;
  reply: string;
}

