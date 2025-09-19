'use client'

import React, { useState, useEffect } from 'react'
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
  Settings,
  Key,
  Info,
  Loader2,
  PlugZap
} from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@/components/providers/WalletProvider'

interface ReaderWalletSettingsProps {
  className?: string
}

export function ReaderWalletSettings({ className = '' }: ReaderWalletSettingsProps) {
  const { readerWalletAddress, setReaderWalletAddress, isConnected, isLoading, publicKey, connect } = useWallet()
  const [isEditing, setIsEditing] = useState(false)
  const [newAddress, setNewAddress] = useState(readerWalletAddress || '')
  const [isCopied, setIsCopied] = useState(false)
  const [useConnectedWallet, setUseConnectedWallet] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Update newAddress when readerWalletAddress changes
  useEffect(() => {
    setNewAddress(readerWalletAddress || '')
  }, [readerWalletAddress])

  const handleCopy = async () => {
    if (!readerWalletAddress) return

    try {
      await navigator.clipboard.writeText(readerWalletAddress)
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

  const handleSaveAddress = () => {
    const addressToSave = useConnectedWallet && publicKey ? publicKey : newAddress

    if (!addressToSave) {
      toast.error('Please enter a wallet address')
      return
    }

    if (!validateStellarAddress(addressToSave)) {
      toast.error('Invalid Stellar address format')
      return
    }

    setReaderWalletAddress(addressToSave)
    toast.success('Reader wallet address updated successfully')
    setIsEditing(false)
    setUseConnectedWallet(false)
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
          setUseConnectedWallet(true)
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
      setUseConnectedWallet(true)
    }
  }

  const handleClearAddress = () => {
    setReaderWalletAddress(null)
    setNewAddress('')
    toast.success('Reader wallet address cleared')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Reader Wallet Settings
        </CardTitle>
        <CardDescription>
          Set your wallet address for sending tips to authors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="space-y-4">
            {readerWalletAddress ? (
              <>
                <div className="space-y-2">
                  <Label>Your Reader Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input
                      value={readerWalletAddress}
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
                  {readerWalletAddress === publicKey && isConnected && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Using your connected wallet
                    </p>
                  )}
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
                    onClick={handleClearAddress}
                  >
                    Clear Address
                  </Button>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This address will be used as the source wallet when you send tips to authors.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Key className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">No Reader Wallet Set</h3>
                  <p className="text-sm text-gray-600">
                    Add your Stellar wallet address to send tips to authors
                  </p>
                </div>
                <Button onClick={() => setIsEditing(true)}>
                  Set Reader Wallet
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
                onChange={(e) => {
                  setNewAddress(e.target.value)
                  setUseConnectedWallet(false)
                }}
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
                  setNewAddress(readerWalletAddress || '')
                  setUseConnectedWallet(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={!newAddress && !useConnectedWallet}
              >
                Save Address
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This address is stored locally and will be used as your wallet for sending tips.
                It can be different from your author wallet address.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}