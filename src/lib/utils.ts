import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} F.CFA`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function getBudgetPeriodStart(d: Date = new Date()): number {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const day = d.getDate();
  if (day >= 25) {
    // Current cycle started on 25th of current month
    return new Date(year, month, 25, 0, 0, 0, 0).getTime();
  } else {
    // Current cycle started on 25th of previous month
    return new Date(year, month - 1, 25, 0, 0, 0, 0).getTime();
  }
}

export function getBudgetPeriodEnd(d: Date = new Date()): number {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const day = d.getDate();
  if (day >= 25) {
    // Current cycle ends on 25th of next month (up to start of 25th, or end of 24th)
    return new Date(year, month + 1, 25, 23, 59, 59, 999).getTime();
  } else {
    // Current cycle ends on 25th of current month
    return new Date(year, month, 25, 23, 59, 59, 999).getTime();
  }
}

export function formatBudgetPeriod(startTimestamp: number, endTimestamp: number): string {
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);
  const startLabel = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endLabel = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `du ${startLabel} au ${endLabel}`;
}
