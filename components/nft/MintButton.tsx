'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MintButtonProps {
  articleId: string | Id<"articles">
  articleTitle: string
  totalTips: number // in dollars
  threshold: number // in dollars
  isAuthor: boolean
  onMintSuccess?: () => void
}

export function MintButton({
  articleId,
  articleTitle,
  totalTips,
  threshold,
  isAuthor,
  onMintSuccess,
}: MintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const mintNFT = useMutation(api.nfts.mintNFT)

  const canMint = totalTips >= threshold && isAuthor
  const progress = Math.min(100, (totalTips / threshold) * 100)

  const handleMint = async () => {
    setIsLoading(true)
    try {
      const nftId = await mintNFT({ 
        articleId: articleId as Id<"articles">
      })

      if (nftId) {
        toast.success(`NFT Minted Successfully! Your article "${articleTitle}" is now an NFT!`)
        setShowDialog(false)
        onMintSuccess?.()
      } else {
        throw new Error('Failed to mint NFT')
      }
    } catch (error) {
      console.error('Minting error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to mint NFT')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthor) {
    return null
  }

  if (totalTips < threshold) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">NFT Minting Progress</span>
          <span className="font-medium">${totalTips.toFixed(2)} / ${threshold.toFixed(2)}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Receive ${(threshold - totalTips).toFixed(2)} more in tips to mint as NFT
        </p>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={!canMint}
        className="w-full"
        variant="default"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Mint as NFT
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint Article as NFT</DialogTitle>
            <DialogDescription>
              Convert your article into a unique NFT on the Stellar blockchain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-secondary p-4 rounded-lg space-y-2">
              <h4 className="font-medium">{articleTitle}</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tips:</span>
                  <span className="font-medium">${totalTips.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Threshold Met:</span>
                  <span className="font-medium text-green-600">✓ Yes</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>By minting this NFT:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You&apos;ll create a unique token representing ownership</li>
                <li>The NFT can be transferred or traded</li>
                <li>You&apos;ll retain authorship attribution</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMint}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Confirm Mint
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}