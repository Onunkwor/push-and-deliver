'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { analyticsService } from '@/services/analytics.service'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart' 
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

// Professional chart configurations
const platformChartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(220, 40%, 45%)', // navy blue
  },
  riders: {
    label: 'Riders',
    color: 'hsl(150, 35%, 42%)', // forest green
  },
  restaurants: {
    label: 'Restaurants',
    color: 'hsl(30, 50%, 48%)', // amber
  },
  referrals: {
    label: 'Referrals',
    color: 'hsl(270, 35%, 45%)', // deep purple
  },
} satisfies ChartConfig

const ridersChartConfig = {
  verified: {
    label: 'Verified',
    color: 'hsl(150, 35%, 42%)', // forest green
  },
  pending: {
    label: 'Pending',
    color: 'hsl(30, 50%, 48%)', // amber
  },
  blocked: {
    label: 'Blocked',
    color: 'hsl(350, 50%, 48%)', // burgundy
  },
  online: {
    label: 'Online',
    color: 'hsl(185, 40%, 45%)', // teal
  },
} satisfies ChartConfig

const restaurantsChartConfig = {
  verified: {
    label: 'Verified',
    color: 'hsl(150, 35%, 42%)', // forest green
  },
  pending: {
    label: 'Pending',
    color: 'hsl(30, 50%, 48%)', // amber
  },
  blocked: {
    label: 'Blocked',
    color: 'hsl(350, 50%, 48%)', // burgundy
  },
  open: {
    label: 'Open',
    color: 'hsl(185, 40%, 45%)', // teal
  },
} satisfies ChartConfig

const withdrawalsChartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(235, 40%, 48%)', // indigo
  },
  pending: {
    label: 'Pending',
    color: 'hsl(30, 50%, 48%)', // amber
  },
  successful: {
    label: 'Successful',
    color: 'hsl(150, 35%, 42%)', // forest green
  },
} satisfies ChartConfig

const verificationChartConfig = {
  verifiedRiders: {
    label: 'Verified Riders',
    color: 'hsl(150, 35%, 42%)', // forest green
  },
  verifiedRestaurants: {
    label: 'Verified Restaurants',
    color: 'hsl(185, 40%, 45%)', // teal
  },
  pendingRiders: {
    label: 'Pending Riders',
    color: 'hsl(30, 50%, 48%)', // amber
  },
  pendingRestaurants: {
    label: 'Pending Restaurants',
    color: 'hsl(320, 40%, 48%)', // mauve
  },
  blockedRiders: {
    label: 'Blocked Riders',
    color: 'hsl(350, 50%, 48%)', // burgundy
  },
  blockedRestaurants: {
    label: 'Blocked Restaurants',
    color: 'hsl(270, 35%, 45%)', // deep purple
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRiders: 0,
    totalRestaurants: 0,
    totalReferrals: 0,
    totalWithdrawals: 0,
    verifiedRiders: 0,
    verifiedRestaurants: 0,
    pendingRiders: 0,
    pendingRestaurants: 0,
    blockedRiders: 0,
    blockedRestaurants: 0,
    pendingWithdrawals: 0,
    successfulWithdrawals: 0,
    onlineRiders: 0,
    openRestaurants: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [
        totals,
        verified,
        pending,
        blocked,
        withdrawals,
        onlineRiders,
        openRestaurants
      ] = await Promise.all([
        analyticsService.getTotalCounts(),
        analyticsService.getVerifiedCounts(),
        analyticsService.getPendingCounts(),
        analyticsService.getBlockedCounts(),
        analyticsService.getWithdrawalStats(),
        analyticsService.getOnlineRidersCount(),
        analyticsService.getOpenRestaurantsCount(),
      ])

      setStats({
        totalUsers: totals.totalUsers,
        totalRiders: totals.totalRiders,
        totalRestaurants: totals.totalRestaurants,
        totalReferrals: totals.totalReferrals,
        totalWithdrawals: totals.totalWithdrawals,
        verifiedRiders: verified.verifiedRiders,
        verifiedRestaurants: verified.verifiedRestaurants,
        pendingRiders: pending.pendingRiders,
        pendingRestaurants: pending.pendingRestaurants,
        blockedRiders: blocked.blockedRiders,
        blockedRestaurants: blocked.blockedRestaurants,
        pendingWithdrawals: withdrawals.pendingWithdrawals,
        successfulWithdrawals: withdrawals.successfulWithdrawals,
        onlineRiders,
        openRestaurants,
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const platformData = [
    { category: 'Users', users: stats.totalUsers, fill: 'var(--color-users)' },
    { category: 'Riders', riders: stats.totalRiders, fill: 'var(--color-riders)' },
    { category: 'Restaurants', restaurants: stats.totalRestaurants, fill: 'var(--color-restaurants)' },
    { category: 'Referrals', referrals: stats.totalReferrals, fill: 'var(--color-referrals)' },
  ]

  const ridersStatusData = [
    { status: 'Verified', verified: stats.verifiedRiders, fill: 'var(--color-verified)' },
    { status: 'Pending', pending: stats.pendingRiders, fill: 'var(--color-pending)' },
    { status: 'Blocked', blocked: stats.blockedRiders, fill: 'var(--color-blocked)' },
    { status: 'Online', online: stats.onlineRiders, fill: 'var(--color-online)' },
  ]

  const restaurantsStatusData = [
    { status: 'Verified', verified: stats.verifiedRestaurants, fill: 'var(--color-verified)' },
    { status: 'Pending', pending: stats.pendingRestaurants, fill: 'var(--color-pending)' },
    { status: 'Blocked', blocked: stats.blockedRestaurants, fill: 'var(--color-blocked)' },
    { status: 'Open', open: stats.openRestaurants, fill: 'var(--color-open)' },
  ]

  const withdrawalsData = [
    { type: 'Total', total: stats.totalWithdrawals, fill: 'var(--color-total)' },
    { type: 'Pending', pending: stats.pendingWithdrawals, fill: 'var(--color-pending)' },
    { type: 'Successful', successful: stats.successfulWithdrawals, fill: 'var(--color-successful)' },
  ]

  const verificationPieData = [
    { name: 'verifiedRiders', value: stats.verifiedRiders, fill: 'var(--color-verifiedRiders)' },
    { name: 'verifiedRestaurants', value: stats.verifiedRestaurants, fill: 'var(--color-verifiedRestaurants)' },
    { name: 'pendingRiders', value: stats.pendingRiders, fill: 'var(--color-pendingRiders)' },
    { name: 'pendingRestaurants', value: stats.pendingRestaurants, fill: 'var(--color-pendingRestaurants)' },
    { name: 'blockedRiders', value: stats.blockedRiders, fill: 'var(--color-blockedRiders)' },
    { name: 'blockedRestaurants', value: stats.blockedRestaurants, fill: 'var(--color-blockedRestaurants)' },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[hsl(220,40%,45%)] bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'hsl(220, 40%, 45%)' }}>{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[hsl(150,35%,42%)] bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Riders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'hsl(150, 35%, 42%)' }}>{stats.totalRiders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold" style={{ color: 'hsl(150, 35%, 42%)' }}>{stats.onlineRiders}</span> online now
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[hsl(30,50%,48%)] bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'hsl(30, 50%, 48%)' }}>{stats.totalRestaurants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold" style={{ color: 'hsl(30, 50%, 48%)' }}>{stats.openRestaurants}</span> open now
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[hsl(270,35%,45%)] bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'hsl(270, 35%, 45%)' }}>{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">All time referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of platform entities</p>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer config={platformChartConfig}>
            <BarChart data={platformData} width={500} height={300}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="var(--color-users)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="riders" fill="var(--color-riders)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="restaurants" fill="var(--color-restaurants)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="referrals" fill="var(--color-referrals)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Riders & Restaurants Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Riders Status</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown of rider accounts</p>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={ridersChartConfig}>
              <AreaChart data={ridersStatusData} width={500} height={300}>
                <defs>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-verified)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-verified)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-pending)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-pending)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-blocked)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-blocked)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-online)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-online)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="verified" stroke="var(--color-verified)" fill="url(#colorVerified)" />
                <Area type="monotone" dataKey="pending" stroke="var(--color-pending)" fill="url(#colorPending)" />
                <Area type="monotone" dataKey="blocked" stroke="var(--color-blocked)" fill="url(#colorBlocked)" />
                <Area type="monotone" dataKey="online" stroke="var(--color-online)" fill="url(#colorOnline)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurants Status</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown of restaurant accounts</p>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={restaurantsChartConfig}>
              <LineChart data={restaurantsStatusData} width={500} height={300}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="verified" stroke="var(--color-verified)" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="pending" stroke="var(--color-pending)" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="blocked" stroke="var(--color-blocked)" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="open" stroke="var(--color-open)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Verification & Withdrawals */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verification Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">All account statuses at a glance</p>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={verificationChartConfig}>
              <PieChart width={500} height={300}>
                <Pie
                  data={verificationPieData.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, ...props }) => {
                    const config = verificationChartConfig[payload.name as keyof typeof verificationChartConfig]
                    return (
                      <text
                        cx={props.cx}
                        cy={props.cy}
                        x={props.x}
                        y={props.y}
                        textAnchor={props.textAnchor}
                        dominantBaseline={props.dominantBaseline}
                        className="fill-foreground text-xs font-medium"
                      >
                        {`${config?.label}: ${payload.value}`}
                      </text>
                    )
                  }}
                  outerRadius={100}
                  dataKey="value"
                >
                  {verificationPieData.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawals Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Withdrawal statistics</p>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={withdrawalsChartConfig}>
              <BarChart data={withdrawalsData} width={500} height={300}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="successful" fill="var(--color-successful)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
