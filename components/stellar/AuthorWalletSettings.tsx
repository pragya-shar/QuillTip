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
  Settings,
  Key,
  Loader2,
  PlugZap
} from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@/components/providers/WalletProvider'

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
  const { isConnected, isLoading, publicKey, connect } = useWallet()
  const [isEditing, setIsEditing] = useState(false)
  const [newAddress, setNewAddress] = useState(authorAddress || '')
  const [isCopied, setIsCopied] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

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

  const validateStellarAddress = (address: string): boolean => {
    // Basic Stellar address validation
    // Stellar addresses are 56 characters and start with 'G' (for public keys)
    const stellarAddressRegex = /^G[A-Z2-7]{55}$/
    return stellarAddressRegex.test(address)
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const success = await connect()
      if (success) {
        toast.success('Wallet connected successfully')
        // Optionally set the connected address as the new address
        if (publicKey) {
          setNewAddress(publicKey)
        }
      }
    } catch {
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleUseConnectedWallet = () => {
    if (publicKey) {
      setNewAddress(publicKey)
      toast.success('Using connected wallet address')
    }
  }

  const handleSaveAddress = async () => {
    if (!newAddress) {
      toast.error('Please enter a wallet address')
      return
    }

    if (!validateStellarAddress(newAddress)) {
      toast.error('Invalid Stellar address format')
      return
    }

    setIsValidating(true)

    try {
      // Save to backend via Convex
      await updateProfile({
        stellarAddress: newAddress
      })

      onAddressChange?.(newAddress)
      toast.success('Author wallet address updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update wallet address:', error)
      toast.error('Failed to update wallet address')
    } finally {
      setIsValidating(false)
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
            {!isEditing ? (
              <div className="space-y-4">
                {authorAddress ? (
                  <>
                    <div className="space-y-2">
                      <Label>Your Wallet Address</Label>
                      <div className="flex gap-2">
                        <Input
                          value={authorAddress}
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

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsEditing(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Change Address
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${authorAddress}`, '_blank')}
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Key className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">No Wallet Connected</h3>
                      <p className="text-sm text-gray-600">
                        Add your Stellar wallet address to receive tips directly
                      </p>
                    </div>
                    <Button onClick={() => setIsEditing(true)}>
                      Add Wallet Address
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Stellar Wallet Address</Label>
                  <Input
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="G..."
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Enter your Stellar public key (starts with &apos;G&apos;)
                  </p>
                </div>

                {/* Wallet Connection Options */}
                <div className="space-y-2">
                  {!isConnected ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleConnectWallet}
                      disabled={isConnecting || isLoading}
                    >
                      {isConnecting || isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <PlugZap className="h-4 w-4 mr-2" />
                          Connect Freighter Wallet
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Alert className="py-2">
                        <Check className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Wallet connected: {publicKey?.slice(0, 6)}...{publicKey?.slice(-6)}
                        </AlertDescription>
                      </Alert>
                      {publicKey !== newAddress && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleUseConnectedWallet}
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Use Connected Wallet
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setNewAddress(authorAddress || '')
                    }}
                    disabled={isValidating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAddress}
                    disabled={isValidating || !newAddress}
                  >
                    {isValidating ? 'Validating...' : 'Save Address'}
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
                  value={authorAddress}
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
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${authorAddress}`, '_blank')}
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