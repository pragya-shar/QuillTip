'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useAuth } from '@/components/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Coins, Heart, Loader2 } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface TipButtonProps {
  articleId: Id<"articles">;
  authorName: string;
  className?: string;
}

const TIP_AMOUNTS = [
  { cents: 100, label: '$1', popular: false },
  { cents: 500, label: '$5', popular: true },
  { cents: 1000, label: '$10', popular: false },
];

export function TipButton({ articleId, authorName, className = '' }: TipButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendTip = useMutation(api.tips.sendTip);

  const handleTip = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to send tips');
      router.push('/auth/signin');
      return;
    }

    const amountCents = selectedAmount || (parseFloat(customAmount) * 100);
    
    if (!amountCents || amountCents < 1) {
      toast.error('Please select or enter a valid amount');
      return;
    }

    if (amountCents > 10000) {
      toast.error('Maximum tip amount is $100');
      return;
    }

    setIsLoading(true);

    try {
      await sendTip({
        articleId,
        amountUsd: amountCents / 100, // Convert cents to dollars
      });

      toast.success(`Successfully tipped ${authorName} $${(amountCents / 100).toFixed(2)}!`);
      setIsOpen(false);
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Tipping error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send tip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Tip Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg ${className}`}
      >
        <Coins className="w-4 h-4" />
        <span className="font-medium">Tip Author</span>
      </button>

      {/* Tip Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Support {authorName}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Show your appreciation with a micro-tip. 97.5% goes directly to the author!
            </p>

            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {TIP_AMOUNTS.map((amount) => (
                <button
                  key={amount.cents}
                  onClick={() => {
                    setSelectedAmount(amount.cents);
                    setCustomAmount('');
                  }}
                  className={`relative px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedAmount === amount.cents
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {amount.popular && (
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                      Popular
                    </span>
                  )}
                  <span className="font-semibold">{amount.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter custom amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: $0.01 • Maximum: $100.00
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={isLoading || (!selectedAmount && !customAmount)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Send Tip</span>
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Powered by Stellar • Instant settlement • Low fees
            </p>
          </div>
        </div>
      )}
    </>
  );
}