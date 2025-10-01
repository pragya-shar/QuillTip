'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Sparkles, Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStellarWallet } from '@/hooks/useStellarWallet'
import { nftClient } from '@/lib/stellar/nft-client'
import { STELLAR_CONFIG } from '@/lib/stellar/config'
import { ConvexHttpClient } from 'convex/browser'

interface MintButtonProps {
  articleId: string | Id<'articles'>
  articleTitle: string
  articleSlug: string
  totalTips: number // in dollars
  threshold: number // in dollars
  isAuthor: boolean
  coverImage?: string
  excerpt?: string
  onMintSuccess?: () => void
}

export function MintButton({
  articleId,
  articleTitle,
  // articleSlug, // Future use for metadata generation
  totalTips,
  threshold,
  isAuthor,
  // coverImage, // Future use for NFT metadata
  // excerpt, // Future use for NFT description
  onMintSuccess,
}: MintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [mintingStep, setMintingStep] = useState<
    'checking' | 'wallet' | 'blockchain' | 'database'
  >('checking')

  const mintNFT = useMutation(api.nfts.mintNFT)
  const wallet = useStellarWallet()

  const canMint = totalTips >= threshold && isAuthor
  const progress = Math.min(100, (totalTips / threshold) * 100)

  // Convert USD to stroops for contract
  const tipAmountInStroops = Math.floor(
    (totalTips / STELLAR_CONFIG.XLM_TO_USD_RATE) * 10_000_000
  )

  // Initialize Convex HTTP client for async calls
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  const handleMint = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      toast.error('Please connect your Stellar wallet first')
      return
    }

    setIsLoading(true)
    setMintingStep('checking')

    try {
      // Step 1: Check eligibility on blockchain
      const eligibility = await nftClient.checkEligibility(
        articleId as string,
        tipAmountInStroops
      )
      if (!eligibility.eligible) {
        throw new Error(
          eligibility.reason || 'Article not eligible for minting'
        )
      }

      // Step 2: Generate metadata using Convex
      setMintingStep('wallet')
      const metadata = await convex.query(api.nfts.generateNFTMetadata, {
        articleId: articleId as Id<'articles'>,
      })

      if (!metadata) {
        throw new Error('Failed to generate NFT metadata')
      }

      // For now, we'll use a simple URL that returns this metadata
      // In the future, this will be stored on IPFS
      const metadataUrl = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`

      // Step 3: Build and sign transaction
      const { xdr } = await nftClient.buildMintTransaction(wallet.publicKey, {
        authorAddress: wallet.publicKey,
        articleId: articleId as string,
        tipAmount: tipAmountInStroops,
        metadataUrl,
      })

      // Step 4: Sign transaction with wallet
      const signedXDR = await wallet.signTransaction(xdr)

      // Step 5: Submit to blockchain
      setMintingStep('blockchain')
      const result = await nftClient.submitMintTransaction(signedXDR)

      if (!result.success) {
        throw new Error(result.error || 'Blockchain transaction failed')
      }

      // Step 6: Update Convex database
      setMintingStep('database')
      const nftId = await mintNFT({
        articleId: articleId as Id<'articles'>,
        tipThreshold: threshold,
      })

      if (nftId) {
        toast.success('NFT minted successfully!')
        setShowDialog(false)
        onMintSuccess?.()
      } else {
        // Blockchain succeeded but database failed - this is a consistency issue
        console.warn('Blockchain mint succeeded but database update failed')
        toast.warning(
          'NFT minted on blockchain but database sync failed. Please refresh the page.'
        )
      }
    } catch (error) {
      console.error('Minting error:', error)

      let errorMessage = 'Failed to mint NFT'
      if (mintingStep === 'wallet') {
        errorMessage = 'Transaction cancelled or wallet error'
      } else if (mintingStep === 'blockchain') {
        errorMessage = 'Blockchain transaction failed. Please try again'
      }

      toast.error(error instanceof Error ? error.message : errorMessage)
    } finally {
      setIsLoading(false)
      setMintingStep('checking')
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
          <span className="font-medium">
            ${totalTips.toFixed(2)} / ${threshold.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          ${(threshold - totalTips).toFixed(2)} more to mint NFT
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
        Mint NFT
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
            {!wallet.isConnected && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-900">
                  Connect your wallet to mint this article as an NFT.
                </p>
              </div>
            )}
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
                {wallet.isConnected && wallet.publicKey ? (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-900 font-medium">
                        ✓ Wallet Connected
                      </span>
                      <span className="font-mono text-green-700">
                        {`${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <span className="text-xs text-amber-900">
                      ⚠ Wallet not connected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Minting in Progress...</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {mintingStep === 'checking' && 'Verifying eligibility...'}
                  {mintingStep === 'wallet' && 'Sign in your wallet...'}
                  {mintingStep === 'blockchain' && 'Minting NFT...'}
                  {mintingStep === 'database' && 'Finalizing...'}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>By minting this NFT:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  You&apos;ll create a unique token representing ownership
                </li>
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

              {!wallet.isConnected ? (
                <Button
                  onClick={wallet.connect}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
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
                      Mint NFT
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
