'use client'

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { ridersService } from '@/services/riders.service'
import type { Rider, Transaction } from '@/types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getStatusLabel, getStatusBadgeVariant } from '@/lib/status-utils'
import { VerificationStatus } from '@/types'

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getVerificationStatusLabel = (status: string | undefined) => {
  switch (status) {
    case VerificationStatus.verified: return 'Verified'
    case VerificationStatus.unverified: return 'Unverified'
    case VerificationStatus.blocked: return 'Blocked'
    case VerificationStatus.deleted: return 'Deleted'
    default: return 'Unverified'
  }
}

const getVerificationBadgeVariant = (status: string | undefined) => {
  switch (status) {
    case VerificationStatus.verified: return 'default'
    case VerificationStatus.blocked: return 'destructive'
    case VerificationStatus.deleted: return 'destructive'
    default: return 'secondary'
  }
}

export default function RiderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [rider, setRider] = useState<Rider | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  useEffect(() => {
    if (id) {
      loadRiderData()
      loadRiderTransactions()
    }
  }, [id])

  const loadRiderData = async () => {
    try {
      setLoading(true)
      const riderData = await ridersService.getRiderById(id!)

      if (!riderData) {
        toast.error('Rider not found')
        navigate('/riders')
        return
      }

      setRider(riderData)
    } catch (error) {
      console.error('Error loading rider:', error)
      toast.error('Failed to load rider data')
    } finally {
      setLoading(false)
    }
  }

  const loadRiderTransactions = async () => {
    try {
      setLoadingTransactions(true)

      // Fetch from subcollection: Riders/{riderId}/Transactions
      const transactionsRef = collection(db, 'Riders', id!, 'Transactions')
      const q = query(transactionsRef, orderBy('time', 'desc'))
      const querySnapshot = await getDocs(q)

      const txns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().time?.toDate?.(),
      })) as Transaction[]

      setTransactions(txns)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('Failed to load rider transactions')
    } finally {
      setLoadingTransactions(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!rider) {
    return null
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/riders')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rider Details</h1>
          <p className="text-muted-foreground">
            Complete information for {rider.fullname || 'rider'}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{rider.fullname || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{rider.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{rider.phonenumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rider ID</p>
              <p className="font-mono text-sm">{rider.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Home Address</p>
              <p className="font-medium">{rider.homeAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
              <Badge variant={getVerificationBadgeVariant(rider.verificationStatus) as any}>
                {getVerificationStatusLabel(rider.verificationStatus)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Online Status</p>
              <Badge variant={rider.onlineStatus ? 'default' : 'secondary'}>
                {rider.onlineStatus ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ongoing Order</p>
              <Badge variant={rider.ongoingOrder ? 'default' : 'secondary'}>
                {rider.ongoingOrder ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Type</p>
              <p className="font-medium capitalize">{rider.vehicleType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Make</p>
              <p className="font-medium">{rider.vehicleMakename || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium">{rider.vehicleModelName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Color</p>
              <p className="font-medium">{rider.vehicleColor || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plate Number</p>
              <p className="font-medium">{rider.plateNumber || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet & Bank Information */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet & Bank Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-bold" style={{ color: 'hsl(150, 35%, 42%)' }}>
                ₦{formatAmount(rider.walletbalance || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{rider.bankInfo?.bankName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Name</p>
              <p className="font-medium">{rider.bankInfo?.acctName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">{rider.bankInfo?.acctNumber || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions found</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">
                        {txn.time instanceof Date
                          ? txn.time.toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={txn.transactionType === 'Credit' ? 'default' : 'secondary'}
                        >
                          {txn.transactionType || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        {txn.narration || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₦{formatAmount(txn.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(txn.status) as any}>
                          {getStatusLabel(txn.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {txn.trxref || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
