// Shared utility for handling status enums across the application

/**
 * Convert numeric or string status to label
 * 0 = Successful, 1 = Pending, 2 = Failed, 3 = Reversed
 */
export const getStatusLabel = (status: any): string => {
  // Handle numeric values
  const statusNum = typeof status === 'string' ? parseInt(status) : status

  if (statusNum === 0) return 'Successful'
  if (statusNum === 1) return 'Pending'
  if (statusNum === 2) return 'Failed'
  if (statusNum === 3) return 'Reversed'

  // Fallback to string check
  if (typeof status === 'string') {
    const lower = status.toLowerCase()
    if (lower === 'successful') return 'Successful'
    if (lower === 'pending') return 'Pending'
    if (lower === 'failed') return 'Failed'
    if (lower === 'reversed') return 'Reversed'
  }

  return 'Unknown'
}

/**
 * Get badge variant for status
 */
export const getStatusBadgeVariant = (status: any): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status

  if (statusNum === 0) return 'default' // Successful - green
  if (statusNum === 1) return 'secondary' // Pending - gray
  if (statusNum === 2) return 'destructive' // Failed - red
  if (statusNum === 3) return 'outline' // Reversed - outlined

  // Fallback to string check
  const label = getStatusLabel(status)
  if (label === 'Successful') return 'default'
  if (label === 'Pending') return 'secondary'
  if (label === 'Failed') return 'destructive'
  if (label === 'Reversed') return 'outline'

  return 'secondary'
}

/**
 * Check if status equals a specific numeric value
 */
export const isStatusEqual = (status: any, targetValue: number): boolean => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  return statusNum === targetValue || status === targetValue.toString()
}
