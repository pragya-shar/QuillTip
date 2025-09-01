'use client';

import { useEffect, useState } from 'react';
import { Coins, Users } from 'lucide-react';

interface TipStatsProps {
  articleId: string;
  className?: string;
}

interface TipData {
  stats: {
    totalTips: number;
    totalAmountUsd: number;
    uniqueTippers: number;
  };
}

export function TipStats({ articleId, className = '' }: TipStatsProps) {
  const [data, setData] = useState<TipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch(`/api/tips/article/${articleId}`);
        if (response.ok) {
          const tipData = await response.json();
          setData(tipData);
        }
      } catch (error) {
        console.error('Failed to fetch tip stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, [articleId]);

  if (isLoading || !data || data.stats.totalTips === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-600 ${className}`}>
      <div className="flex items-center gap-1">
        <Coins className="w-4 h-4 text-yellow-500" />
        <span className="font-medium">${data.stats.totalAmountUsd.toFixed(2)}</span>
        <span>earned</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{data.stats.uniqueTippers}</span>
        <span>supporters</span>
      </div>
    </div>
  );
}