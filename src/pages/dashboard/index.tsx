'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { analyticsService } from '@/services/analytics.service'

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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform metrics</p>
      </div>

      {/* Main Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Riders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRiders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.onlineRiders} online now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.openRestaurants} open now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time referrals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Riders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedRiders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingRiders} pending verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedRestaurants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingRestaurants} pending verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Blocked Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.blockedRiders + stats.blockedRestaurants}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.blockedRiders} riders, {stats.blockedRestaurants} restaurants
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawals Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Withdrawals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWithdrawals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Successful Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successfulWithdrawals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed requests
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
