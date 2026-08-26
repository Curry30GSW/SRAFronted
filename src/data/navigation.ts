import {
  LayoutDashboard,
  Puzzle,
  BarChart3,
} from 'lucide-react'
import type { NavSection } from '@/types'

export const navigation: NavSection[] = [
    {
    title: 'Asociaciones',
    items: [
      { label: 'Home', icon: BarChart3, href: '/asociados' },
      {
        label: 'Fases Asociacion',
        icon: LayoutDashboard,
        children: [
          { label: 'Fase 1', href: '/asociaciones/F1' },
          { label: 'Fase 2', href: '/asociaciones/F2' },
          { label: 'Fase 3', href: '/crm/contacts' },
        ],
      }, 
      { label: 'Links', icon: Puzzle, href: '/links' },   
    ],
  },
  // {
  //   title: 'Apps',
  //   items: [
  //     { label: 'AI Chat', icon: MessageSquare, href: '/ai/chat', badge: 'New' },
  //     {
  //       label: 'CRM',
  //       icon: Users,
  //       children: [
  //         { label: 'Contacts', href: '/crm/contacts' },
  //         { label: 'Pipeline', href: '/crm/contacts' },
  //       ],
  //     },
  //     {
  //       label: 'Billing',
  //       icon: CreditCard,
  //       children: [
  //         { label: 'Overview', href: '/billing' },
  //         { label: 'Invoices', href: '/billing' },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   title: 'Design System',
  //   items: [
  //     { label: 'Components', icon: Puzzle, href: '/components' },
  //     { label: 'Settings', icon: Settings, href: '/settings' },
  //     { label: 'Help', icon: HelpCircle, href: '/help' },
  //   ],
  // },
]
