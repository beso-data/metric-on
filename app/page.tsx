// app/page.tsx
'use client';

import React from 'react';
import { MetricProvider, useMetric } from '@/app/context/MetricContext';
import LoginView from '@/app/components/views/LoginView';
import DashboardView from '@/app/components/views/DashboardView';
import SalesView from '@/app/components/views/SalesView';
import InventoryView from '@/app/components/views/InventoryView';
import SuppliersView from '@/app/components/views/SuppliersView';
import RecipesView from '@/app/components/views/RecipesView';
import InvoicesView from '@/app/components/views/InvoicesView';
import PayrollView from '@/app/components/views/PayrollView';
import SettingsView from '@/app/components/views/SettingsView';
import SupportView from '@/app/components/views/SupportView';
import AppShell from '@/app/components/AppShell';

function MainRouter() {
  const { isAuthenticated, ownerTab } = useMetric();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <AppShell>
      {ownerTab === 'dashboard' && <DashboardView />}
      {ownerTab === 'sales' && <SalesView />}
      {ownerTab === 'inventory' && <InventoryView />}
      {ownerTab === 'suppliers' && <SuppliersView />}
      {ownerTab === 'recipes' && <RecipesView />}
      {ownerTab === 'invoices' && <InvoicesView />}
      {ownerTab === 'payroll' && <PayrollView />}
      {ownerTab === 'settings' && <SettingsView />}
      {ownerTab === 'support' && <SupportView />}
    </AppShell>
  );
}

export default function MetricOnPage() {
  return (
    <MetricProvider>
      <MainRouter />
    </MetricProvider>
  );
}