'use client';

import { useEffect, useState } from 'react';
import { Coins, TrendingUp, Clock, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EarningsData {
  earnings: {
    totalTips: number;
    totalEarnedUsd: number;
    pendingAmountUsd: number;
    lastWithdrawal: string | null;
  };
  recentTips: Array<{
    id: string;
    amountUsd: number;
    article: {
      title: string;
      slug: string;
    };
    tipper: {
      username: string;
      name: string | null;
    };
    createdAt: string;
  }>;
  articleStats: Array<{
    articleId: string;
    title: string;
    slug: string;
    totalTips: number;
    totalAmountUsd: number;
  }>;
}

export function EarningsDashboard() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/earnings/balance');
      if (response.ok) {
        const earningsData = await response.json();
        setData(earningsData);
      } else {
        toast.error('Failed to load earnings data');
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleWithdraw = async () => {
    if (!data || data.earnings.pendingAmountUsd < 1) {
      toast.error('Minimum withdrawal amount is $1.00');
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch('/api/earnings/withdraw', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Successfully withdrew $${result.withdrawal.amountUsd.toFixed(2)}`);
        // Refresh earnings data
        await fetchEarnings();
      } else {
        toast.error(result.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load earnings data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Earned</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${data.earnings.totalEarnedUsd.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.earnings.totalTips} tips received
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Pending Balance</span>
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${data.earnings.pendingAmountUsd.toFixed(2)}
          </p>
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || data.earnings.pendingAmountUsd < 1}
            className="mt-3 w-full px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWithdrawing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </span>
            ) : (
              'Withdraw'
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Last Withdrawal</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {data.earnings.lastWithdrawal
              ? new Date(data.earnings.lastWithdrawal).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Top Articles */}
      {data.articleStats.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Earning Articles
            </h3>
          </div>
          <div className="divide-y">
            {data.articleStats.slice(0, 5).map((article) => (
              <div key={article.articleId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{article.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {article.totalTips} tips
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${article.totalAmountUsd.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tips */}
      {data.recentTips.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Tips</h3>
          </div>
          <div className="divide-y">
            {data.recentTips.map((tip) => (
              <div key={tip.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {tip.tipper.name || tip.tipper.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      tipped on &ldquo;{tip.article.title}&rdquo;
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +${tip.amountUsd.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.earnings.totalTips === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tips received yet
          </h3>
          <p className="text-gray-600">
            Share your articles to start receiving tips from readers!
          </p>
        </div>
      )}
    </div>
  );
}