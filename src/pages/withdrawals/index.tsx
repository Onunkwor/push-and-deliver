'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { withdrawalsService } from '@/services/withdrawals.service'
import type { Withdrawal } from '@/types'
import { WithdrawalStatus } from '@/types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadWithdrawals = async () => {
    try {
      setLoading(true)
      const data = await withdrawalsService.getAllWithdrawals()
      setWithdrawals(data)
    } catch (error) {
      console.error('Error loading withdrawals:', error)
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.accountname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.bankname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userID?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      w.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (id: string, status: WithdrawalStatus) => {
    try {
      setActionLoading(id)
      await withdrawalsService.updateWithdrawalStatus(id, status)
      toast.success(`Withdrawal ${status.toLowerCase()} successfully`)
      await loadWithdrawals()
    } catch (error) {
      console.error('Error updating withdrawal:', error)
      toast.error('Failed to update withdrawal')
    } finally {
      setActionLoading(null)
    }
  }

  const totalWithdrawals = withdrawals.length
  const pendingWithdrawals = withdrawals.filter((w) => w.status === WithdrawalStatus.Pending).length
  const successfulWithdrawals = withdrawals.filter((w) => w.status === WithdrawalStatus.Successful).length
  const totalAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
          <p className="text-muted-foreground">Manage withdrawal requests</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
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
        <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
        <p className="text-muted-foreground">Manage withdrawal requests and update their status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithdrawals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulWithdrawals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{formatAmount(totalAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>View and manage all withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by account name, bank, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={WithdrawalStatus.Pending}>Pending</SelectItem>
                <SelectItem value={WithdrawalStatus.Successful}>Successful</SelectItem>
                <SelectItem value={WithdrawalStatus.Failed}>Failed</SelectItem>
                <SelectItem value={WithdrawalStatus.Reversed}>Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Account Name</TableHead>
                  <TableHead>Bank Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No withdrawals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{withdrawal.accountname || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{withdrawal.bankname || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-sm">{withdrawal.accountnumber || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        ₦{formatAmount(withdrawal.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{withdrawal.userType || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            withdrawal.status === WithdrawalStatus.Successful
                              ? 'default'
                              : withdrawal.status === WithdrawalStatus.Failed
                              ? 'destructive'
                              : withdrawal.status === WithdrawalStatus.Reversed
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {withdrawal.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === withdrawal.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {withdrawal.status === WithdrawalStatus.Pending && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(withdrawal.id!, WithdrawalStatus.Successful)}
                                >
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(withdrawal.id!, WithdrawalStatus.Failed)}
                                >
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {withdrawal.status === WithdrawalStatus.Successful && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(withdrawal.id!, WithdrawalStatus.Reversed)}
                              >
                                Reverse
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
