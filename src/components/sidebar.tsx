'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, Users, Utensils, DollarSign, Share2, LogOut } from 'lucide-react'

const navItems = [
  {
    label: 'Restaurants & Riders',
    href: '/admin/merchants',
    icon: Utensils,
  },
  {
    label: 'Fees',
    href: '/admin/fees',
    icon: DollarSign,
  },
  {
    label: 'Referrals',
    href: '/admin/referrals',
    icon: Share2,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Withdrawals',
    href: '/admin/withdrawals',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage your platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors">
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  )
}
