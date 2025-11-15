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
import { ridersService } from '@/services/riders.service'
import type { Rider } from '@/types'
import { VerificationStatus } from '@/types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadRiders()
  }, [])

  const loadRiders = async () => {
    try {
      setLoading(true)
      const data = await ridersService.getAllRiders()
      setRiders(data)
    } catch (error) {
      console.error('Error loading riders:', error)
      toast.error('Failed to load riders')
    } finally {
      setLoading(false)
    }
  }

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phonenumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      r.verificationStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleVerify = async (id: string) => {
    try {
      setActionLoading(id)
      await ridersService.verifyRider(id)
      toast.success('Rider verified successfully')
      await loadRiders()
    } catch (error) {
      console.error('Error verifying rider:', error)
      toast.error('Failed to verify rider')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlock = async (id: string) => {
    try {
      setActionLoading(id)
      await ridersService.blockRider(id)
      toast.success('Rider blocked successfully')
      await loadRiders()
    } catch (error) {
      console.error('Error blocking rider:', error)
      toast.error('Failed to block rider')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnblock = async (id: string) => {
    try {
      setActionLoading(id)
      await ridersService.unblockRider(id)
      toast.success('Rider unblocked successfully')
      await loadRiders()
    } catch (error) {
      console.error('Error unblocking rider:', error)
      toast.error('Failed to unblock rider')
    } finally {
      setActionLoading(null)
    }
  }

  const totalRiders = riders.length
  const verifiedRiders = riders.filter((r) => r.verificationStatus === VerificationStatus.verified).length
  const blockedRiders = riders.filter((r) => r.verificationStatus === VerificationStatus.blocked).length
  const totalWalletBalance = riders.reduce((sum, r) => sum + (r.walletbalance || 0), 0)

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riders</h1>
          <p className="text-muted-foreground">Manage delivery riders</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Riders</h1>
        <p className="text-muted-foreground">Manage delivery riders, verification, and wallet balances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Riders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRiders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedRiders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedRiders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{formatAmount(totalWalletBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rider Details</CardTitle>
          <CardDescription>View all riders with verification status and wallet information</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                <SelectItem value={VerificationStatus.verified}>Verified</SelectItem>
                <SelectItem value={VerificationStatus.unverified}>Pending</SelectItem>
                <SelectItem value={VerificationStatus.blocked}>Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Online</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No riders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRiders.map((rider) => (
                    <TableRow key={rider.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{rider.fullname || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{rider.email || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{rider.phonenumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rider.vehicleMakename || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rider.verificationStatus === VerificationStatus.verified
                              ? 'default'
                              : rider.verificationStatus === VerificationStatus.blocked
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {rider.verificationStatus || 'unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rider.onlineStatus ? 'default' : 'outline'}>
                          {rider.onlineStatus ? 'Online' : 'Offline'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₦{formatAmount(rider.walletbalance || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading === rider.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rider.verificationStatus !== VerificationStatus.verified && (
                              <DropdownMenuItem onClick={() => handleVerify(rider.id!)}>
                                Verify Rider
                              </DropdownMenuItem>
                            )}
                            {rider.verificationStatus === VerificationStatus.blocked ? (
                              <DropdownMenuItem onClick={() => handleUnblock(rider.id!)}>
                                Unblock
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleBlock(rider.id!)}>
                                Block Rider
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
