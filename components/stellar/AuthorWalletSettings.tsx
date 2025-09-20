'use client'

import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Wallet,
  Copy,
  Check,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  Loader2,
  PlugZap,
  Power
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthorWallet } from '@/hooks/useAuthorWallet'

interface AuthorWalletSettingsProps {
  authorAddress?: string
  onAddressChange?: (address: string) => void
  isOwnProfile: boolean
  className?: string
}

export function AuthorWalletSettings({
  authorAddress,
  onAddressChange,
  isOwnProfile,
  className = ''
}: AuthorWalletSettingsProps) {
  const updateProfile = useMutation(api.users.updateProfile)
  const {
    isConnecting: authorWalletConnecting,
    error: authorWalletError,
    connectForAuthor,
    resetConnection
  } = useAuthorWallet()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (!authorAddress) return

    try {
      await navigator.clipboard.writeText(authorAddress)
      setIsCopied(true)
      toast.success('Wallet address copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Failed to copy address')
    }
  }

  const handleConnectAuthorWallet = async () => {
    try {
      const result = await connectForAuthor()
      if (result.success && result.address) {
        // Automatically save the connected address
        await updateProfile({
          stellarAddress: result.address
        })

        onAddressChange?.(result.address)
        toast.success('Author wallet connected and saved successfully!')
        resetConnection()
      } else {
        toast.error('Failed to connect wallet')
      }
    } catch {
      toast.error('Failed to connect and save wallet address')
    }
  }

  const handleDisconnectAuthorWallet = async () => {
    try {
      await updateProfile({
        stellarAddress: undefined
      })

      onAddressChange?.('')
      resetConnection()
      toast.success('Author wallet disconnected')
    } catch {
      toast.error('Failed to disconnect wallet')
    }
  }

  if (!isOwnProfile && !authorAddress) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This author hasn&apos;t set up their Stellar wallet yet.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Stellar Wallet
        </CardTitle>
        <CardDescription>
          {isOwnProfile
            ? 'Manage your Stellar wallet for receiving tips'
            : 'Send tips directly to this author&apos;s Stellar wallet'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwnProfile ? (
          <>
            {!authorAddress ? (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connect your Freighter wallet to receive tips from readers
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleConnectAuthorWallet}
                  disabled={authorWalletConnecting}
                  className="w-full"
                  size="lg"
                >
                  {authorWalletConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting to Freighter...
                    </>
                  ) : (
                    <>
                      <PlugZap className="w-4 h-4 mr-2" />
                      Connect Freighter Wallet
                    </>
                  )}
                </Button>

                {authorWalletError && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {authorWalletError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have Freighter?{' '}
                  <a
                    href="https://freighter.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Install it here
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connected State */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Author Wallet Connected</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Your Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input
                        value={authorAddress || ''}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Tips will be sent directly to this wallet address. You can change it anytime by disconnecting and connecting a different account.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => authorAddress && window.open(`https://stellar.expert/explorer/testnet/account/${authorAddress}`, '_blank')}
                    disabled={!authorAddress}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                  <Button
                    onClick={handleDisconnectAuthorWallet}
                    variant="outline"
                    className="flex-1"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Author&apos;s Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  value={authorAddress || ''}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => authorAddress && window.open(`https://stellar.expert/explorer/testnet/account/${authorAddress}`, '_blank')}
              disabled={!authorAddress}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View on Stellar Explorer
            </Button>

            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Tips sent to this wallet go directly to the author with minimal platform fees.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}