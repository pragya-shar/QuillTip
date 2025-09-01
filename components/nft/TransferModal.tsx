'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  articleId: string
  articleTitle: string
  currentOwner: string
  onTransferComplete?: (newOwner: string) => void
}

export function TransferModal({
  isOpen,
  onClose,
  articleId,
  articleTitle,
  currentOwner,
  onTransferComplete
}: TransferModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferStatus, setTransferStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validateStellarAddress = (address: string): boolean => {
    // Basic Stellar address validation (56 characters starting with G)
    return /^G[A-Z2-7]{55}$/.test(address)
  }

  const handleTransfer = async () => {
    // Reset error state
    setErrorMessage('')
    
    // Validate recipient address
    if (!validateStellarAddress(recipientAddress)) {
      setErrorMessage('Invalid Stellar address. Must be 56 characters starting with G')
      return
    }

    // Prevent self-transfer
    if (recipientAddress === currentOwner) {
      setErrorMessage('Cannot transfer to yourself')
      return
    }

    setIsTransferring(true)
    setTransferStatus('confirming')

    try {
      // Call API to transfer NFT
      const response = await fetch('/api/nft/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          recipientAddress
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Transfer failed')
      }

      await response.json()

      // Show success state
      setTransferStatus('success')
      
      // Show success toast
      toast.success(`NFT Transferred Successfully! Article NFT has been transferred to ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}`)

      // Notify parent component
      if (onTransferComplete) {
        onTransferComplete(recipientAddress)
      }

      // Close modal after delay
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error) {
      setTransferStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Transfer failed')
      
      toast.error(errorMessage || 'Transfer failed')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleClose = () => {
    // Reset state
    setRecipientAddress('')
    setTransferStatus('idle')
    setErrorMessage('')
    onClose()
  }

  const getStatusMessage = () => {
    switch (transferStatus) {
      case 'confirming':
        return 'Please confirm the transaction in your wallet...'
      case 'success':
        return 'Transfer completed successfully!'
      case 'error':
        return errorMessage || 'Transfer failed. Please try again.'
      default:
        return ''
    }
  }

  const getStatusIcon = () => {
    switch (transferStatus) {
      case 'confirming':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer NFT Ownership</DialogTitle>
          <DialogDescription>
            Transfer ownership of &quot;{articleTitle}&quot; to another Stellar address.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-owner">Current Owner</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="current-owner"
                value={`${currentOwner.slice(0, 6)}...${currentOwner.slice(-6)}`}
                disabled
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="G..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono"
              disabled={isTransferring}
            />
            <p className="text-xs text-muted-foreground">
              Enter the Stellar public address of the new owner
            </p>
          </div>

          {/* Status Alert */}
          {transferStatus !== 'idle' && (
            <Alert variant={transferStatus === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <AlertDescription>{getStatusMessage()}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Once transferred, you will lose ownership of this NFT
              and all associated rights. Make sure you trust the recipient.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              !recipientAddress || 
              isTransferring || 
              transferStatus === 'success'
            }
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : transferStatus === 'success' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Transferred
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Transfer NFT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}