'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  PlugZap,
  Power
} from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@/components/providers/WalletProvider'

interface ReaderWalletSettingsProps {
  className?: string
}

export function ReaderWalletSettings({ className = '' }: ReaderWalletSettingsProps) {
  const {
    readerWalletAddress,
    setReaderWalletAddress,
    isConnected,
    isLoading,
    publicKey,
    connect,
    disconnect,
    network
  } = useWallet()
  const [isCopied, setIsCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Automatically use connected wallet address as reader wallet
  useEffect(() => {
    if (isConnected && publicKey && !readerWalletAddress) {
      setReaderWalletAddress(publicKey)
    }
  }, [isConnected, publicKey, readerWalletAddress, setReaderWalletAddress])

  const handleCopy = async () => {
    const addressToCopy = readerWalletAddress || publicKey
    if (!addressToCopy) return

    try {
      await navigator.clipboard.writeText(addressToCopy)
      setIsCopied(true)
      toast.success('Wallet address copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Failed to copy address')
    }
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const success = await connect()
      if (success) {
        toast.success('Wallet connected successfully!', {
          description: 'You can now send tips to authors'
        })
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setReaderWalletAddress(null)
    toast.success('Wallet disconnected')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Reader Wallet
          </div>
          {isConnected && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Freighter wallet to send tips to authors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Wallet Connection */}
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your Freighter wallet to start sending tips to your favorite authors
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting || isLoading}
              className="w-full"
              size="lg"
            >
              {isConnecting || isLoading ? (
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
                  <span className="text-sm font-medium">Wallet Connected</span>
                </div>
                {network && (
                  <Badge variant="outline" className="text-xs">
                    {network}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Your Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={publicKey || ''}
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
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your wallet is connected and ready to send tips. When you tip an author,
                Freighter will ask you to sign the transaction.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              <Power className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}