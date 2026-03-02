'use client';

import { useDashboardContext } from '@/providers/DashboardProvider';

export function useDashboard() {
  return useDashboardContext();
}
