export enum TransactionCategory {
  MARCHE = "Marché",
  DEJEUNER = "Déjeuner",
  RIZ = "Riz",
  ELECTRICITE = "Électricité",
  GAZ = "Gaz",
  SAVON = "Savon",
  CANAL_PLUS = "Canal+",
  TRANSPORT = "Transport",
  INTERNET = "Internet",
  EAU = "Eau",
  DIVERS = "Divers",
}

export interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory | string;
  date: number; // timestamp
  note: string;
  userId: string;
}

export interface Income {
  id: string;
  salaryReceived: number;
  dateReceived: number; // timestamp
  userId: string;
}

export interface FinancialReport {
  id: string;
  content: string;
  createdAt: any;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  weeklyReports: boolean;
  budgetNotifications: boolean;
}

export interface CategoryBudget {
  id: string;
  category: string;
  amount: number;
  userId: string;
}

export interface Archive {
  id: string;
  monthLabel: string;
  archivedAt: number;
  transactions: Transaction[];
  incomes: Income[];
  budgets: CategoryBudget[];
  totalIncome: number;
  totalExpenses: number;
  userId: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
