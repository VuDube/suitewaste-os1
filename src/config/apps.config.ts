import React from 'react';
import {
  LayoutDashboard,
  Map,
  ShieldCheck,
  CreditCard,
  Store,
  GraduationCap,
  Bot,
  Settings,
  LucideProps,
} from 'lucide-react';
import DashboardApp from '@/components/apps/DashboardApp';
import OperationsApp from '@/components/apps/OperationsApp';
import ComplianceApp from '@/components/apps/ComplianceApp';
import PaymentsApp from '@/components/apps/PaymentsApp';
import MarketplaceApp from '@/components/apps/MarketplaceApp';
import TrainingApp from '@/components/apps/TrainingApp';
import AssistantApp from '@/components/apps/AssistantApp';
import SettingsApp from '@/components/apps/SettingsApp';
export interface AppConfig {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  component: React.ComponentType;
  pinned?: boolean;
}
export const APPS: AppConfig[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    component: DashboardApp,
    pinned: true,
  },
  {
    id: 'operations',
    title: 'Operations',
    icon: Map,
    component: OperationsApp,
    pinned: true,
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: ShieldCheck,
    component: ComplianceApp,
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    component: PaymentsApp,
  },
  {
    id: 'marketplace',
    title: 'e-Waste Marketplace',
    icon: Store,
    component: MarketplaceApp,
  },
  {
    id: 'training',
    title: 'Training Hub',
    icon: GraduationCap,
    component: TrainingApp,
  },
  {
    id: 'assistant',
    title: 'AI Assistant',
    icon: Bot,
    component: AssistantApp,
    pinned: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    component: SettingsApp,
  },
];