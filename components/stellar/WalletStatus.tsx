'use client';

import { useWallet } from '@/components/providers/WalletProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Wallet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WalletStatusProps {
  className?: string;
}

export function WalletStatus({ className }: WalletStatusProps) {
  const {
    isInstalled,
    isConnected,
    publicKey,
    network,
    networkPassphrase,
    error,
    refreshConnection
  } = useWallet();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const openInExplorer = (address: string) => {
    const explorerUrl = network === 'TESTNET'
      ? `https://stellar.expert/explorer/testnet/account/${address}`
      : `https://stellar.expert/explorer/public/account/${address}`;
    window.open(explorerUrl, '_blank');
  };

  if (!isInstalled) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Freighter Wallet Required</h3>
              <p className="text-sm text-muted-foreground">
                Install Freighter to connect your Stellar wallet
              </p>
            </div>
            <Button onClick={() => window.open('https://freighter.app/', '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Install Freighter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Wallet Connection Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button variant="outline" onClick={refreshConnection}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Wallet Not Connected</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Freighter wallet to start tipping authors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Wallet className="w-4 h-4 text-green-600" />
          </div>
          Wallet Connected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-sm bg-muted px-2 py-1 rounded truncate">
                {publicKey}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => publicKey && copyToClipboard(publicKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => publicKey && openInExplorer(publicKey)}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {network && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Network</label>
              <div className="mt-1">
                <Badge
                  variant={network === 'TESTNET' ? 'secondary' : 'default'}
                  className="capitalize"
                >
                  {network.toLowerCase()}
                </Badge>
              </div>
            </div>
          )}

          {networkPassphrase && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Network Passphrase</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                  {networkPassphrase}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(networkPassphrase)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={refreshConnection} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Connection
        </Button>
      </CardContent>
    </Card>
  );
}